# Build Jarvis on Your Laptop — Complete Guide

A **double-clap desktop launcher**. Clap twice near your laptop and Jarvis:

1. 🔊 speaks a greeting (offline voice — no internet or API key),
2. 🌐 opens a set of browser tabs,
3. 🖥️ launches a set of desktop apps.

Everything it does is configured in a small `.env` file. This single document
has **all the code** — follow it top to bottom and you'll have a working Jarvis.

Works on **macOS, Windows, and Linux**.

---

## 1. Prerequisites

- **Python 3.9+** — check with `python3 --version` (Windows: `python --version`).
  - macOS: `brew install python` (or it's already there).
  - Windows: install from [python.org](https://www.python.org/downloads/) and tick
    **"Add Python to PATH"**.
  - Linux: `sudo apt install python3 python3-venv python3-pip`
- A **working microphone**.
- Linux only: audio + speech system packages:
  ```bash
  sudo apt install libportaudio2 espeak-ng
  ```

---

## 2. Create the project

Make a folder and add the four files below.

```bash
mkdir jarvis && cd jarvis
```

### 2a. `jarvis.py`

Create a file named `jarvis.py` with **exactly** this content:

```python
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
import threading
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
REFRACTORY_S = 6.0            # after firing, ignore all audio this long so the
                              # spoken greeting can't re-trigger the flow (the
                              # mic hearing its own voice = a feedback loop)


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
        self.suppress_until = 0.0     # ignore audio until this time (refractory)

    def feed(self, rms: float, now: float) -> bool:
        """Process one block. Returns True if this block completes a double clap."""
        self.last_was_clap = False
        # During the refractory window (just after firing) ignore everything,
        # including the greeting playing through the speakers, so it can't
        # re-trigger us. Don't feed these loud blocks into the baseline either.
        if now < self.suppress_until:
            return False
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
            self.suppress_until = now + REFRACTORY_S
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
            # Run off the audio thread: speak()/launch can block for seconds,
            # and blocking here would stall mic capture.
            threading.Thread(target=run_welcome_flow, daemon=True).start()

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
```

### 2b. `requirements.txt`

```text
numpy>=1.24,<3
sounddevice>=0.4.6,<0.6
python-dotenv>=1.0,<2
pyttsx3>=2.90,<3
```

### 2c. `.env`

This is where you customize what Jarvis does. Create a file named `.env`:

```ini
# What Jarvis says on a double clap.
JARVIS_GREETING=Welcome back. Systems are online.

# Comma-separated URLs opened in your default browser.
JARVIS_URLS=https://claude.ai,https://github.com

# Comma-separated desktop apps to launch.
#   macOS:   app names              -> Cursor, Spotify
#   Windows: exe or Start-menu name -> Cursor.exe, notepad
#   Linux:   binary on PATH         -> code, gnome-terminal
JARVIS_APPS=Cursor
```

---

## 3. Install & run

From inside the `jarvis` folder:

### macOS / Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python jarvis.py
```

### Windows (PowerShell)
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python jarvis.py
```

When you see `listening for double claps…`, **clap twice**, firmly, about a
third of a second apart. Jarvis greets you, opens your tabs, launches your apps,
then ignores audio for 6 seconds. Press `Ctrl-C` to quit.

> **First run asks for microphone permission.** macOS/Windows will prompt — say
> **Allow / Yes**. If you don't grant it, Jarvis runs but never hears claps.

---

## 4. Customize

Edit `.env` and restart Jarvis. Examples:

```ini
JARVIS_GREETING=Good morning. Let's get to work.
JARVIS_URLS=https://mail.google.com,https://calendar.google.com,https://news.ycombinator.com
JARVIS_APPS=Spotify, Slack, Visual Studio Code
```

### Tuning detection (top of `jarvis.py`)

| Constant | Raise it to… | Lower it to… |
|---|---|---|
| `MIN_RMS` | stop false triggers | catch quieter claps |
| `SPIKE_RATIO` | require a sharper clap | catch softer claps |
| `DOUBLE_CLAP_WINDOW_S` | allow slower double-claps | require faster ones |
| `REFRACTORY_S` | longer pause after firing | re-arm sooner |

---

## 5. Troubleshooting

Run with the **debug level meter** to see what the mic hears:

```bash
# macOS/Linux
JARVIS_DEBUG=1 python jarvis.py
# Windows PowerShell
$env:JARVIS_DEBUG=1; python jarvis.py
```

You'll see a live bar like `level 0.180 (need >0.040) |#######`.

| Symptom | Cause | Fix |
|---|---|---|
| Bar stays `0.000` while clapping | Mic not reaching the app | Grant microphone permission to your terminal (macOS: System Settings → Privacy & Security → Microphone). Check the right input device is selected. |
| Bar moves but no `👏 clap` line | Claps too quiet | Lower `MIN_RMS` (e.g. `0.02`) and/or `SPIKE_RATIO` |
| Single `👏 clap` but no flow | Two claps too far apart | Clap faster, or raise `DOUBLE_CLAP_WINDOW_S` |
| **Keeps repeating the greeting** | Mic heard its own voice (feedback loop) | Already handled by `REFRACTORY_S`; raise it if your greeting is long, or lower your speaker volume |
| `OSError: PortAudio library not found` (Linux) | Missing system lib | `sudo apt install libportaudio2` |
| No voice on Linux | No TTS engine | `sudo apt install espeak-ng` |

**Remember:** the listener (`python jarvis.py`) must actually be running for
claps to do anything.

---

## 6. (Optional) Auto-start on login

### macOS — LaunchAgent
Create `~/Library/LaunchAgents/com.jarvis.doubleclap.plist` (replace the two
paths with your real ones — run `pwd` inside the jarvis folder and use
`<that path>/.venv/bin/python` and `<that path>/jarvis.py`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>            <string>com.jarvis.doubleclap</string>
    <key>ProgramArguments</key>
    <array>
        <string>/ABSOLUTE/PATH/TO/jarvis/.venv/bin/python</string>
        <string>/ABSOLUTE/PATH/TO/jarvis/jarvis.py</string>
    </array>
    <key>WorkingDirectory</key> <string>/ABSOLUTE/PATH/TO/jarvis</string>
    <key>RunAtLoad</key>        <true/>
    <key>KeepAlive</key>        <true/>
    <key>StandardOutPath</key>  <string>/ABSOLUTE/PATH/TO/jarvis/jarvis.log</string>
    <key>StandardErrorPath</key><string>/ABSOLUTE/PATH/TO/jarvis/jarvis.err.log</string>
</dict>
</plist>
```

Load / unload:
```bash
launchctl load   ~/Library/LaunchAgents/com.jarvis.doubleclap.plist   # start + enable
launchctl unload ~/Library/LaunchAgents/com.jarvis.doubleclap.plist   # stop + disable
```
> Grant microphone permission by running `python jarvis.py` once manually
> **before** loading the agent — background agents can't show the prompt.

### Windows — Startup folder
Create `start-jarvis.bat` with:
```bat
@echo off
cd /d "C:\path\to\jarvis"
".venv\Scripts\pythonw.exe" jarvis.py
```
Press `Win+R`, type `shell:startup`, and drop a shortcut to that `.bat` in the
folder that opens.

### Linux — systemd user service
Create `~/.config/systemd/user/jarvis.service`:
```ini
[Unit]
Description=Jarvis double-clap launcher
[Service]
ExecStart=/ABSOLUTE/PATH/TO/jarvis/.venv/bin/python /ABSOLUTE/PATH/TO/jarvis/jarvis.py
Restart=always
[Install]
WantedBy=default.target
```
```bash
systemctl --user enable --now jarvis.service
```

---

## 7. What Jarvis can and can't do

**Can:** detect a double clap, speak an offline greeting, open browser tabs,
launch desktop apps, auto-start on login, run a live debug meter, and avoid
re-triggering on its own voice.

**Can't (yet):** dictate/type, control music playback, answer questions, or run
shell commands. It's a *trigger-and-launch* tool. Any of those can be added by
extending `run_welcome_flow()`.

---

Made for a laptop. Clap twice. 👏👏
