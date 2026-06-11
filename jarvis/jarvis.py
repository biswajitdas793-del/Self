#!/usr/bin/env python3
"""Jarvis — double-clap desktop launcher.

Listens to your default microphone and waits for a *double clap*. When it hears
one it runs a small "welcome flow": speaks a greeting with offline text-to-speech,
opens a set of browser tabs, and launches a set of desktop apps.

Everything that changes between machines (the greeting, the URLs, the apps) is
read from environment variables / a local ``.env`` file, so you should not need
to edit this file to use it. The audio tuning constants below are the only knobs
you might want to touch if detection feels too eager or too sleepy.

Run it with::

    python jarvis.py

and clap twice. Ctrl-C to quit.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import time
import webbrowser
from collections import deque

import numpy as np
import sounddevice as sd

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # python-dotenv is optional at runtime
    pass


# --- Tunable audio constants -------------------------------------------------
# A clap is a short, loud spike relative to the recent ambient level. These
# control how that spike is detected. Tweak if you get false triggers (raise
# SPIKE_RATIO / MIN_RMS) or missed claps (lower them).
SAMPLE_RATE = 44_100          # Hz — microphone sample rate
BLOCK_MS = 20                 # ms — length of each analysis block
MIN_RMS = 0.04                # absolute loudness floor a clap must clear
SPIKE_RATIO = 4.0             # clap must be this many× the rolling baseline
COOLDOWN_S = 0.20             # ignore new claps for this long after one fires
DOUBLE_CLAP_WINDOW_S = 0.6    # two claps within this window = a double clap
BASELINE_BLOCKS = 50          # how many recent blocks form the ambient baseline


def _block_size() -> int:
    return int(SAMPLE_RATE * BLOCK_MS / 1000)


# --- Action helpers ----------------------------------------------------------
def speak(text: str) -> None:
    """Say ``text`` out loud using whatever offline TTS the OS offers.

    Tries native tools first (no dependencies), then falls back to pyttsx3.
    Never raises — a machine with no speech setup just stays silent.
    """
    if not text:
        return

    try:
        if sys.platform == "darwin" and shutil.which("say"):
            subprocess.run(["say", text], check=False)
            return
        if sys.platform.startswith("linux"):
            if shutil.which("spd-say"):
                subprocess.run(["spd-say", "--wait", text], check=False)
                return
            if shutil.which("espeak-ng") or shutil.which("espeak"):
                engine = shutil.which("espeak-ng") or shutil.which("espeak")
                subprocess.run([engine, text], check=False)
                return
        if sys.platform == "win32":
            # System.Speech ships with Windows — no install needed.
            ps = (
                "Add-Type -AssemblyName System.Speech;"
                "(New-Object System.Speech.Synthesis.SpeechSynthesizer)"
                f".Speak('{text}')"
            )
            subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=False)
            return
    except Exception as exc:  # pragma: no cover - environment dependent
        print(f"[jarvis] native TTS failed ({exc}); trying pyttsx3", file=sys.stderr)

    # Cross-platform fallback.
    try:
        import pyttsx3

        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as exc:  # pragma: no cover - environment dependent
        print(f"[jarvis] could not speak ({exc}): {text}", file=sys.stderr)


def open_urls(urls: list[str]) -> None:
    """Open each URL in the default browser."""
    for url in urls:
        print(f"[jarvis] opening {url}")
        try:
            webbrowser.open(url, new=2)
        except Exception as exc:  # pragma: no cover - environment dependent
            print(f"[jarvis] failed to open {url}: {exc}", file=sys.stderr)


def launch_app(name: str) -> None:
    """Launch a desktop app by name, cross-platform.

    ``name`` is whatever your OS expects: a macOS app name ("Cursor"), a
    Windows executable or Start-menu name ("Cursor.exe", "notepad"), or a
    Linux binary on PATH ("code", "gnome-terminal").
    """
    print(f"[jarvis] launching {name}")
    try:
        if sys.platform == "darwin":
            subprocess.Popen(["open", "-a", name])
        elif sys.platform == "win32":
            # `start` resolves Start-menu apps and PATH executables alike.
            subprocess.Popen(["cmd", "/c", "start", "", name], shell=False)
        else:  # linux / other unix
            binary = shutil.which(name)
            if binary:
                subprocess.Popen([binary])
            elif shutil.which("gtk-launch"):
                subprocess.Popen(["gtk-launch", name])
            else:
                subprocess.Popen([name])
    except Exception as exc:  # pragma: no cover - environment dependent
        print(f"[jarvis] failed to launch {name}: {exc}", file=sys.stderr)


def _split_env(name: str) -> list[str]:
    """Read a comma-separated env var into a clean list."""
    raw = os.getenv(name, "")
    return [item.strip() for item in raw.split(",") if item.strip()]


def run_welcome_flow() -> None:
    """The thing that happens on a double clap. Customize via your .env."""
    greeting = os.getenv("JARVIS_GREETING", "Welcome back. Systems are online.")
    urls = _split_env("JARVIS_URLS")
    apps = _split_env("JARVIS_APPS")

    print("\n[jarvis] 👏👏 double clap detected — running welcome flow")
    speak(greeting)
    open_urls(urls)
    for app in apps:
        launch_app(app)
    print("[jarvis] welcome flow complete\n")


# --- Clap detection ----------------------------------------------------------
def listen() -> None:
    """Stream the mic, detect double claps, and fire the welcome flow."""
    block = _block_size()
    baseline = deque(maxlen=BASELINE_BLOCKS)
    last_clap_at = 0.0          # time of the most recent single clap
    last_fire_at = 0.0          # time the cooldown started
    pending_clap_at = 0.0       # first clap of a potential double

    print(
        "[jarvis] listening for double claps "
        f"(rate={SAMPLE_RATE}Hz, block={BLOCK_MS}ms). Ctrl-C to quit."
    )

    def callback(indata, frames, time_info, status):  # noqa: ANN001
        nonlocal last_clap_at, last_fire_at, pending_clap_at
        if status:
            print(f"[jarvis] audio status: {status}", file=sys.stderr)

        rms = float(np.sqrt(np.mean(np.square(indata[:, 0]))))
        now = time.monotonic()

        # Build an ambient baseline from recent quiet-ish blocks.
        ambient = np.median(baseline) if baseline else MIN_RMS
        is_spike = rms >= MIN_RMS and rms >= ambient * SPIKE_RATIO

        # Only feed non-spike blocks into the baseline so claps don't inflate it.
        if not is_spike:
            baseline.append(rms)

        if not is_spike or (now - last_fire_at) < COOLDOWN_S:
            return

        last_fire_at = now
        # A clap registered. Is it the second one within the window?
        if pending_clap_at and (now - pending_clap_at) <= DOUBLE_CLAP_WINDOW_S:
            pending_clap_at = 0.0
            run_welcome_flow()
        else:
            pending_clap_at = now
        last_clap_at = now

    try:
        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=1,
            blocksize=block,
            callback=callback,
        ):
            while True:
                time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n[jarvis] goodbye")


if __name__ == "__main__":
    listen()
