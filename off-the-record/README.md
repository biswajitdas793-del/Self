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
- **Attract loop** — while idle it cycles full-screen through each location's
  animated **film** (see below) and the live Intelligence Wall to pull a crowd,
  and a "Touch to begin" pulse appears. Any tap drops back to the vault.

### Location films — anime stills + Ken Burns
Each of the five files has its own **animated location scene** — an anime-style,
hand-built layered **SVG** (sunset palace at Patiala, floating lamps at Haridwar,
sunrise boulder fields at Hampi, temple-by-the-sea at Somnath, bioluminescent
shore at the Andamans) brought to life with a slow **Ken Burns** pan/zoom plus
drifting clouds, bobbing lamps and twinkling light. They appear:
- as a **film banner** at the top of each declassified file (the open-file modal), and
- as **full-screen films** in the kiosk attract loop.

No external images, APIs or keys — the art is generated in-browser, so it loads
instantly and ships in the single HTML file.

**Real AI anime stills (optional).** Five anime-style location stills have been
generated in Canva, and `ART_IMG` in `index.html` already references them at
`art/<id>.jpg`. The wiring is **fallback-safe**: each film renders the SVG scene as
its base layer and overlays the photo only if the file loads — so until you add the
JPGs the films look exactly as before, and the moment you drop them into `art/` they
switch to the photos (with the same Ken Burns + parallax). See
[`art/README.md`](art/README.md) for the Canva links and the one-step download
instructions.

### Ambient sound per location
Each film carries its own **procedurally-synthesised ambience** (Web Audio API —
again, no audio files): a temple drone + bells at Patiala, sea swells + a bell at
Somnath, a flowing river + aarti bells at Haridwar, open wind at Hampi, and slow
ocean waves + a low underwater drone at the Andamans. The soundscape fades in when
a film opens (file modal or kiosk) and fades out when it closes.
- **Mute toggle** in the header (🔊 / 🔇); the preference is remembered in
  `localStorage`.
- Audio unlocks on the first tap (browser autoplay policy), so in the kiosk attract
  loop sound begins once a visitor first interacts.

### Parallax depth on the films
The location scenes have **real depth**: the scene and a soft foreground highlight
move on separate planes driven by **mouse position** (desktop) or the **device
gyroscope** (phones/tablets), layered on top of the Ken Burns motion. On iOS the
motion permission is requested on the first tap. This is the same parallax illusion
the files use — now applied to the films so the stills feel alive rather than flat.

### Take-home dossier — real QR + lead capture
The dossier now closes the loop for a member who's standing at the booth:
- **Scannable QR code** (real, generated in-browser via an inlined, minified copy of
  the MIT-licensed `qrcode-generator`). It encodes a **shareable URL** with the
  member's answers + matches packed into the link hash, so scanning it opens *their
  exact dossier* on their phone — theirs to keep. Arriving at `…/#d=…` rebuilds and
  shows the dossier directly.
- **Lead capture** — an optional name/email form. Saved leads live in `localStorage`
  on the kiosk (`otr_leads_v1`) and surface as **"Members captured"** on the
  Intelligence Wall. Email is lightly validated; everything stays on the device
  unless you wire it to a backend.

> Wiring leads to email/CRM: replace `saveLead()` in `index.html` with a POST to your
> endpoint (or a Supabase insert). The shape is `{ ts, name, email, top[] }`.

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
- ✅ The dossier QR is a **real, scannable code** that opens the member's personalised
  dossier on their phone. Lead capture is real but **kiosk-local** until you point
  `saveLead()` at a backend.

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
