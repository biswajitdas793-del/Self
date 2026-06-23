# OFF THE RECORD — The Vault

> *Discover what this year's retreats won't tell you in the brochure.*

An **AI + AR concept experience** for YPO-style retreats. Instead of a booth that
says *"here's what we're offering,"* this one says *"here's what people really get
from these experiences"* — the campfire conversations, the marriages saved, the
ideas born on a mountain. The stories that never make the brochure.

This folder is a **self-contained, single-file pitch demo**. No build step, no
backend, no dependencies. Open `index.html` and it runs.

---

## The concept in one screen

1. **The Vault** — a "CLASSIFIED · EYES ONLY" landing. *"Discover what this year's
   retreats won't tell you in the brochure."*
2. **The AI Host** — types out a short, confidential interview. The killer prompt:
   *"Tell me something you're **not** putting on your LinkedIn profile this year."*
   (Burnout · Family priorities · Desire for adventure · Feeling stuck · Searching
   for meaning.)
3. **The Confidential Files (AR feel)** — five "files," one per destination, that
   tilt with your mouse / phone gyroscope. Tap one and it *declassifies*: the
   off-the-record moments + the one conversation that defines it.
4. **The Dossier** — a printable, personalised *"Off-the-Record Dossier"* with the
   member's top 3 retreat matches, driven by their answers.

Plus an **Unlocked Conversations** strip — every retreat represented not by a
destination but by a conversation (*"The apology underwater that no email could
carry."*).

## Booth features

### Kiosk mode — `index.html?kiosk=1`
Open the page with `?kiosk=1` to run it as an unattended booth kiosk:
- **Fullscreen** on the first tap.
- **Idle auto-reset** — after ~45s of no interaction it clears the member's
  session and returns to the vault, ready for the next person.
- **Attract loop** — while idle it cycles between the vault and the live
  Intelligence Wall to pull a crowd, and a "Touch to begin" pulse appears.

### The Intelligence Wall
A backstage, aggregate view of what members confess (link in the header, a button
on the dossier, and part of the kiosk attract loop):
- **"What members aren't putting on LinkedIn this year"** — live breakdown of the
  confession categories (Burnout, Family priorities, Adventure, Stuck, Meaning).
- **Most-requested files** — which retreats get recommended most.
- **Totals** — briefings logged, confessions intercepted.
- **A redacted ticker** of anonymised, trimmed free-text confessions.

**Storage:** submissions are saved in the browser's `localStorage` on the kiosk
device — perfect for a single all-day booth, no backend or keys required. The wall
seeds with a handful of sample entries so it looks alive on first run; real
submissions replace nothing — they're simply added.

**Multi-device aggregation (optional upgrade):** to pool confessions across several
kiosks or show the wall on a separate screen, replace `loadSubs()/saveSubs()` in
`index.html` with calls to a backend (e.g. a single Supabase table
`off_record_submissions` with insert-only RLS, plus a read for aggregates). The
data shape is already flat and ready: `{ ts, hope, time, leak, leakText, top[] }`.

## The five files

| File | Codename | Destination | The conversation |
|------|----------|-------------|------------------|
| 07 | Adventure | **Hampi**, Karnataka | *"The idea that arrived at the top of a thousand-year-old rock."* |
| 09 | The Royal Table | **Patiala**, Punjab | *"The toast that turned three competitors into co-founders."* |
| 14 | Family Connection | **Andaman Islands** | *"The apology underwater that no email could ever carry."* |
| 16 | Tides & Lions | **Somnath / Gir**, Gujarat | *"The question a lion's stare asked that the boardroom never did."* |
| 22 | Wellness Reset | **Haridwar**, Uttarakhand | *"The confession at the river that lifted a ten-year weight."* |

## The recommendation engine

Each answer carries hidden tags (`adventure`, `family`, `wellness`, `meaning`,
`leadership`, `stuck`, `burnout`, `belonging`). Each destination has a weighting
across those tags. The member's answers are scored against all five; the top three
glow as **RECOMMENDED** and flow into the dossier. It's deterministic and fully
client-side — easy to tune by editing the `RETREATS` and `QUESTIONS` arrays at the
top of the `<script>` block in `index.html`.

## Run it

```bash
# from this folder
python3 -m http.server 8000
# open http://localhost:8000
```

Or just double-click `index.html`. On a phone, the files respond to tilt
(device orientation); on desktop, to mouse movement.

## What this is — and isn't

- ✅ A clickable **pitch demo** to show stakeholders what the booth would *feel* like.
- ✅ Self-contained, brandable, tunable in one file.
- ⚠️ Not real AR — there's no live camera or 3D tracking. The "AR" is a parallax /
  gyroscope-driven illusion that conveys the intent.
- ⚠️ The dossier "QR" is a **decorative vault seal**, not a scannable code. Wire it
  to a real link/QR before any live use.

## Making this its own repository

This lives inside another project's repo only because of a tooling restriction in
the environment it was generated in. To give it a clean home:

```bash
# copy this folder out, then:
cd off-the-record
git init
git add .
git commit -m "Off the Record — concept pitch demo"
# create an empty repo on GitHub, then:
git remote add origin git@github.com:<you>/off-the-record-vault.git
git push -u origin main
```

Deploy by dropping the folder on Vercel / Netlify / GitHub Pages — it's static.

---

*A concept experience. Off the record means off the record — nothing here leaves the room.*
