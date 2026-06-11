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

### Linux audio / TTS
- Microphone capture uses PortAudio. If `sounddevice` fails to import, install
  it: `sudo apt install libportaudio2`.
- Offline speech uses `spd-say` (speech-dispatcher) or `espeak`/`espeak-ng`.
  Install one, e.g. `sudo apt install espeak-ng`. `pyttsx3` is the fallback.

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
