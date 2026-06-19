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
class ClapDetector:
    """Turns a stream of audio-block loudness values into double-clap events.

    Pure logic, no audio I/O — feed it RMS values with timestamps via
    :meth:`feed` and it returns ``True`` exactly on the block that completes a
    double clap. Kept separate from the microphone stream so it can be tuned
    and tested with synthetic input.
    """

    def __init__(self) -> None:
        self.baseline: deque[float] = deque(maxlen=BASELINE_BLOCKS)
        self.last_fire_at = 0.0       # when the cooldown last started
        self.pending_clap_at = 0.0    # first clap of a potential double
        # Diagnostics, refreshed every feed() — handy for the debug meter.
        self.ambient = MIN_RMS        # current ambient baseline
        self.threshold = MIN_RMS      # loudness a clap must currently clear
        self.last_was_clap = False    # did this block register as a clap?

    def feed(self, rms: float, now: float) -> bool:
        """Process one block. Returns True if this block completes a double clap."""
        self.last_was_clap = False
        # Build an ambient baseline from recent quiet-ish blocks.
        ambient = float(np.median(self.baseline)) if self.baseline else MIN_RMS
        self.ambient = ambient
        self.threshold = max(MIN_RMS, ambient * SPIKE_RATIO)
        is_spike = rms >= MIN_RMS and rms >= ambient * SPIKE_RATIO

        # Only feed non-spike blocks into the baseline so claps don't inflate it.
        if not is_spike:
            self.baseline.append(rms)

        if not is_spike or (now - self.last_fire_at) < COOLDOWN_S:
            return False

        self.last_fire_at = now
        self.last_was_clap = True
        # A clap registered. Is it the second one within the window?
        if self.pending_clap_at and (now - self.pending_clap_at) <= DOUBLE_CLAP_WINDOW_S:
            self.pending_clap_at = 0.0
            return True
        self.pending_clap_at = now
        return False


def _rms(block: np.ndarray) -> float:
    """Root-mean-square loudness of a mono audio block."""
    return float(np.sqrt(np.mean(np.square(block[:, 0]))))


def listen() -> None:
    """Stream the mic, detect double claps, and fire the welcome flow."""
    block = _block_size()
    detector = ClapDetector()
    debug = os.getenv("JARVIS_DEBUG", "").strip().lower() in {"1", "true", "yes", "on"}

    print(
        "[jarvis] listening for double claps "
        f"(rate={SAMPLE_RATE}Hz, block={BLOCK_MS}ms). Ctrl-C to quit."
    )
    if debug:
        print("[jarvis] DEBUG on — showing a live level meter. Clap and watch.")

    meter = {"peak": 0.0, "blocks": 0}

    def callback(indata, frames, time_info, status):  # noqa: ANN001
        if status:
            print(f"[jarvis] audio status: {status}", file=sys.stderr)
        rms = _rms(indata)
        fired = detector.feed(rms, time.monotonic())

        if debug:
            meter["peak"] = max(meter["peak"], rms)
            meter["blocks"] += 1
            if detector.last_was_clap:
                print(
                    f"[jarvis][debug] 👏 clap  rms={rms:.3f}  "
                    f"threshold={detector.threshold:.3f}"
                )
            # Print a level bar a few times a second so silence is visible too.
            if meter["blocks"] >= 15:
                bar = "#" * int(min(meter["peak"], 1.0) * 40)
                print(
                    f"[jarvis][debug] level {meter['peak']:.3f} "
                    f"(need >{detector.threshold:.3f}) |{bar}"
                )
                meter["peak"] = 0.0
                meter["blocks"] = 0

        if fired:
            run_welcome_flow()

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
