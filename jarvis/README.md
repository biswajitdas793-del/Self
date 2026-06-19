# Jarvis — double-clap desktop launcher

Listens to your default microphone and runs a **double-clap welcome flow**:
speaks a greeting with offline text-to-speech, opens a set of browser tabs, and
launches a set of desktop apps. Cross-platform (macOS / Windows / Linux), no
cloud API keys required.

This is a customized recreation of the idea behind
[hectorg2211/jarvis](https://github.com/hectorg2211/jarvis): the voice uses your
OS's built-in offline TTS instead of ElevenLabs, the actions are configurable,
and app/URL launching works on all three desktop platforms.

## Setup

```bash
cd jarvis
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then edit .env to taste
python jarvis.py            # clap twice; Ctrl-C to quit
```

## Go live on macOS (auto-start)

To make Jarvis run automatically and stay running across logins, use the
installer. It creates the venv, installs deps, verifies the build, and installs
a [LaunchAgent](https://www.launchd.info/):

```bash
cd jarvis
./install-macos.sh
```

It pauses once to let you grant **microphone permission** — important, because a
background LaunchAgent can't show macOS's permission prompt, so you grant it by
running Jarvis manually in Terminal once when prompted.

```bash
tail -f jarvis.log                                   # watch it
launchctl unload ~/Library/LaunchAgents/com.jarvis.doubleclap.plist   # stop
```

To uninstall: `launchctl unload ~/Library/LaunchAgents/com.jarvis.doubleclap.plist && rm ~/Library/LaunchAgents/com.jarvis.doubleclap.plist`

> On macOS the `sounddevice` wheel bundles PortAudio, so no extra install is
> needed. If import ever fails, run `brew install portaudio`.

### Linux audio / TTS
- Microphone capture uses PortAudio. If `sounddevice` fails to import, install
  it: `sudo apt install libportaudio2`.
- Offline speech uses `spd-say` (speech-dispatcher) or `espeak`/`espeak-ng`.
  Install one, e.g. `sudo apt install espeak-ng`. `pyttsx3` is the fallback.

## Verify it works (no mic needed)

The clap-detection algorithm is isolated in `ClapDetector`, so you can test it
with synthetic audio:

```bash
python test_jarvis.py
```

This drives single/double/too-slow clap sequences through the detector and
checks the welcome flow speaks, opens every URL, and launches every app.

## Configure (`.env`)

| Variable | What it does |
| --- | --- |
| `JARVIS_GREETING` | The phrase spoken on a double clap. |
| `JARVIS_URLS` | Comma-separated URLs opened in your default browser. |
| `JARVIS_APPS` | Comma-separated desktop apps to launch (see below). |

App names are whatever your OS expects:

| OS | Example `JARVIS_APPS` |
| --- | --- |
| macOS | `Cursor, Spotify` (app names; launched with `open -a`) |
| Windows | `Cursor.exe, notepad` (exe or Start-menu name) |
| Linux | `code, gnome-terminal` (binary on `PATH`) |

## Tuning detection

The constants at the top of `jarvis.py` control clap sensitivity:

| Constant | Meaning |
| --- | --- |
| `MIN_RMS` | Absolute loudness floor a clap must clear. |
| `SPIKE_RATIO` | A clap must be this many× louder than recent ambient noise. |
| `COOLDOWN_S` | Ignore new claps for this long after one fires. |
| `DOUBLE_CLAP_WINDOW_S` | Two claps within this window count as a double clap. |
| `SAMPLE_RATE`, `BLOCK_MS` | Mic sample rate and analysis block size. |

Getting false triggers? Raise `MIN_RMS` / `SPIKE_RATIO`. Missing claps? Lower
them.

## Troubleshooting: it doesn't hear my claps

Run with the debug level meter to see exactly what the mic picks up:

```bash
JARVIS_DEBUG=1 python jarvis.py
```

You'll get a live readout per block, e.g. `level 0.180 (need >0.040) |#######`.

- **Bar stays at `0.000` while you clap** → the mic isn't reaching the process.
  On macOS grant access in **System Settings → Privacy & Security →
  Microphone** for your terminal app, then restart. Also check the right input
  device is selected in **System Settings → Sound → Input**.
- **Bar moves but never says `👏 clap`** → your claps don't clear the threshold.
  Lower `MIN_RMS` (e.g. to `0.02`) and/or `SPIKE_RATIO` in `jarvis.py`.
- **Single claps register but the flow never runs** → the two claps are too far
  apart; clap a bit faster or raise `DOUBLE_CLAP_WINDOW_S`.

Remember: the listener must actually be running (`python jarvis.py`) for claps
to do anything — the installer's build step only runs a synthetic self-test.
