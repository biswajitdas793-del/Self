"""Smoke tests for jarvis — no microphone required.

Drives ClapDetector with synthetic loudness values and verifies the welcome
flow's side effects via mocking. Run: python test_jarvis.py
"""

from __future__ import annotations

import sys
from unittest import mock

import numpy as np

import jarvis


def test_double_clap_fires():
    """Two spikes within the window should fire exactly once."""
    d = jarvis.ClapDetector()
    quiet = 0.005
    clap = 1.0

    fired = []
    t = 0.0
    # ~0.4s of ambient to establish a baseline.
    for _ in range(20):
        assert not d.feed(quiet, t)
        t += jarvis.BLOCK_MS / 1000

    # First clap.
    fired.append(d.feed(clap, t))
    t += 0.30  # gap inside DOUBLE_CLAP_WINDOW_S, past COOLDOWN_S
    # Second clap completes the double.
    fired.append(d.feed(clap, t))

    assert fired == [False, True], f"expected single fire on 2nd clap, got {fired}"
    print("PASS: double clap fires once on the second clap")


def test_single_clap_does_not_fire():
    d = jarvis.ClapDetector()
    t = 0.0
    for _ in range(20):
        d.feed(0.005, t)
        t += 0.02
    assert d.feed(1.0, t) is False
    print("PASS: a lone clap does not fire")


def test_claps_too_far_apart_dont_fire():
    d = jarvis.ClapDetector()
    t = 0.0
    for _ in range(20):
        d.feed(0.005, t)
        t += 0.02
    assert d.feed(1.0, t) is False
    t += jarvis.DOUBLE_CLAP_WINDOW_S + 0.2   # too slow
    # This becomes a *new* first clap, not a completion.
    assert d.feed(1.0, t) is False
    print("PASS: claps spaced beyond the window do not fire")


def test_rms_of_block():
    block = np.full((100, 1), 0.5, dtype=np.float32)
    assert abs(jarvis._rms(block) - 0.5) < 1e-6
    print("PASS: RMS computed correctly")


def test_welcome_flow_runs_all_actions(monkeypatch_env=None):
    """run_welcome_flow speaks, opens every URL, and launches every app."""
    env = {
        "JARVIS_GREETING": "Hello there",
        "JARVIS_URLS": "https://a.test, https://b.test",
        "JARVIS_APPS": "AppOne, AppTwo",
    }
    with mock.patch.dict(jarvis.os.environ, env, clear=False), \
            mock.patch.object(jarvis, "speak") as m_speak, \
            mock.patch.object(jarvis, "webbrowser") as m_web, \
            mock.patch.object(jarvis, "launch_app") as m_launch:
        jarvis.run_welcome_flow()

    m_speak.assert_called_once_with("Hello there")
    assert m_web.open.call_count == 2, m_web.open.call_args_list
    assert [c.args[0] for c in m_launch.call_args_list] == ["AppOne", "AppTwo"]
    print("PASS: welcome flow speaks, opens 2 URLs, launches 2 apps")


if __name__ == "__main__":
    tests = [
        test_double_clap_fires,
        test_single_clap_does_not_fire,
        test_claps_too_far_apart_dont_fire,
        test_rms_of_block,
        test_welcome_flow_runs_all_actions,
    ]
    failures = 0
    for t in tests:
        try:
            t()
        except AssertionError as exc:
            failures += 1
            print(f"FAIL: {t.__name__}: {exc}")
    print(f"\n{len(tests) - failures}/{len(tests)} passed")
    sys.exit(1 if failures else 0)
