#!/usr/bin/env bash
#
# Make Jarvis "live" on macOS: set up a virtualenv, install dependencies,
# verify the build, then install a LaunchAgent so it auto-starts on login and
# stays running. Re-running this script safely reinstalls/reloads everything.
#
# Usage:  cd jarvis && ./install-macos.sh
#
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="$DIR/.venv/bin/python"
LABEL="com.jarvis.doubleclap"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

echo "==> Creating virtualenv and installing dependencies"
python3 -m venv "$DIR/.venv"
"$DIR/.venv/bin/pip" install --quiet --upgrade pip
"$DIR/.venv/bin/pip" install --quiet -r "$DIR/requirements.txt"

if [ ! -f "$DIR/.env" ]; then
  cp "$DIR/.env.example" "$DIR/.env"
  echo "==> Created .env from .env.example — edit it to set your greeting/URLs/apps."
fi

echo "==> Verifying the build (no microphone needed)"
"$PY" "$DIR/test_jarvis.py"

echo
echo "==> IMPORTANT: microphone permission"
echo "    The first time Jarvis opens the mic, macOS asks to grant access."
echo "    A background LaunchAgent can't show that prompt, so grant it once now:"
echo
echo "        $PY $DIR/jarvis.py"
echo
echo "    Clap twice, confirm the welcome flow runs, then press Ctrl-C."
read -r -p "    Press Return once you've granted mic access (or to skip)... " _ || true

echo "==> Installing LaunchAgent at $PLIST"
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PY</string>
        <string>$DIR/jarvis.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$DIR/jarvis.log</string>
    <key>StandardErrorPath</key>
    <string>$DIR/jarvis.err.log</string>
</dict>
</plist>
EOF

# Reload cleanly whether or not it was already loaded.
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

echo
echo "==> Jarvis is live. It started now and will auto-start on every login."
echo "    Logs:       tail -f $DIR/jarvis.log"
echo "    Stop now:   launchctl unload $PLIST"
echo "    Uninstall:  launchctl unload $PLIST && rm $PLIST"
