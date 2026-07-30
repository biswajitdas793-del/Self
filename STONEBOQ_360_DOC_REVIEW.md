# Review — `StoneBOQ_Why_No_360.pdf`

Reviewed against the StoneBOQ project README (the "single source of truth" md, commit `154be81`) and
the client's own files: `2d1_2.dwg`, `Shwrm Flrn.pdf`, `Wall elevation.pdf`.

Review date: 30 July 2026.

---

## Verdict

The document is good. Its central conclusion — an automatic walkable 360 cannot be built from these
DWGs — is correct, and it is argued the right way round: six requirements stated first, then measured
against each file. Every percentage in it recomputes exactly. §1 and the closing
"What we should NOT promise" paragraph are the strongest parts and should not be touched.

Four things would cause real damage if it goes to Ishaan as-is, and there are nine smaller fixes.
One of the four is a finding in your favour: **the reason the document gives for the missing data is
probably wrong, and the true reason is stronger than the one you wrote.**

---

## Critical

### C1 — §4 promises "a real 360". The md forbids exactly that phrase.

> §4: "The tool then produces a real 360 where every surface is labelled either measured from drawing
> or assumed by estimator."

md §4.1: *"No photoreal 360 / walk-through. … A photoreal spin does not exist — in this tool or any
other."*

A Sales Head reads "a real 360" as a photoreal walkthrough and sells it that way. The whole document
exists to prevent that sale. Fix the noun:

> "The tool then produces a navigable **schematic** 360 — real geometry, plain representative
> surfaces, permanent `SCHEMATIC MASSING` watermark. Not photoreal, and not a video."

### C2 — The BOQ row shows 44% / 17% where the honest number is 3.3%.

§3's "Nested cutting layout / BOQ" row lists *"Files with named building-element layers — 2d1 (44%),
Stall (17%)."* Those are **layer-naming coverage** figures, but sitting in a row about BOQ output they
read as BOQ automation coverage.

md §4.3 gives the real number: on the real customer file, machine-readable tags were ~151 elements
≈ **3.3%** of a 4,625-piece manual BOQ, and *"the gap is structural, not parser tuning."*

44% vs 3.3% is a 13× overstatement of the thing the customer will actually pay for. Put 3.3% in that
row, and relabel the other two as "layer-name coverage — not BOQ coverage".

### C3 — The stated cause of the missing data looks wrong, and the real cause is a better argument.

The document's thesis sentence:

> "The bridge between them — wall heights, door locations, ceilings — is not in the DWG because
> architects don't draft it for fit-out work."

Evidence from the DWG you supplied (`2d1_2.dwg`, 574 KB, format AC1024) points elsewhere:

| Found in the file | Meaning |
| --- | --- |
| Last saved by **AutoCAD LT 2023** (`T.192.0.0`), user `mayuresh.yende`, 2026-07-23 | The editor in the chain is LT |
| `AEC_WALL_INTER`, `AEC_VARS_`, `AECS_DISP_R`, `AecArchBase80`, `AecDbSlabEdgeStyle`, `AecsDbDispPropsMemberLogical`, `DbDispRepStair` | The file carries **AutoCAD Architecture (AEC/ADT) custom objects** |
| `AEC_DISP_REP_SPACE_MODEL`, `Zone`, `Member`, `Height` | AEC **Space** objects — which *are* closed room polygons with a name, an area and a height |
| `Door`, `WindowEle`, `Plan` | AEC door / window content and display representations |
| `IMAGEDEF` | Raster images are **attached**, not embedded |
| Both client PDFs plotted by **AutoCAD LT 2023** (`pdfplot16.hdi`) | LT is also what produces their deliverables |

Reading: this drawing's lineage is AutoCAD Architecture. It once had real Wall, Space, Door and Window
objects — i.e. four of your six requirements. It is now being edited and saved in **AutoCAD LT, which
cannot author AEC objects**; LT degrades them to proxy graphics that expose cached line-work and no
properties. So the heights, the room polygons and the door/window semantics were most likely
**present upstream and destroyed by the LT round-trip** — not never drafted.

Why this matters three ways:

1. **The conclusion survives, stronger.** Nothing downstream can recover a height from a proxy. That
   is a harder wall than "architects don't draft it", which is an assumption about someone's habits.
2. **The current sentence is refutable in one minute.** Anyone on the customer side who opens the file
   in full AutoCAD or ACA can see the architectural objects and conclude you didn't look properly.
3. **It opens a remedy that costs nothing.** Ask the architect for the **pre-LT source, or a DWG saved
   out of AutoCAD Architecture**. If that file still has live AEC Spaces and Walls, several of the six
   requirements arrive for free and the answer for that customer changes.

**Confirm before you rewrite the sentence.** I could not run a real DWG parse here — no ODA File
Converter or LibreDWG in this environment, and the package mirror is blocked by the proxy, so the
table above comes from a raw byte scan of the class and AppInfo sections, not a parse. On the operator's
machine: convert with ODA and check for `AecDbWall` / `AecDbSpace` proxy entities and `$PROXYGRAPHICS`.
If it confirms, this is the most valuable finding in the document.

### C4 — The door claim is circular.

> "The file contains 2 door 1 blocks but their insert points fall OUTSIDE every detected room plan."
> → verdict **Missing**.

Two rows above, the same table reports room closure at **25%**. You cannot prove a door lies outside
the rooms using a room set you have just declared three-quarters incomplete. State it as measured
rather than concluded, and fix the garbled phrase:

> "2 inserts of a block named `door 1`. Both fall outside the room outlines the tool was able to close
> (25% closure), so neither can be attached to a room automatically."

---

## High

### H1 — `mail GC 2.dwg` is unfinished, so the document is a draft.

Its rows read *"Measurement running in the fleet"* and *"Verdict to be added when the fleet lands"*.
The honesty is right and in keeping with md §9, but a table handed to a Sales Head with a blank
verdict column gets quoted for the three rows that are filled and forgotten for the fourth. Either
finish the measurement, or lift that file out of the main table into a one-line note with a date.

Separately: **"the fleet"** is internal jargon. Ishaan does not know what a fleet is or what it means
for one to "land".

### H2 — "Reproduces what the customer produces by hand" overstates, and their own PDFs prove it.

What the tool produces is a dimensioned PNG of the drawing's model-space geometry. What the client
actually delivers — visible in both PDFs — is an **A3 sheet plotted from AutoCAD LT** containing:

- a fully filled CMC title block: project `KAMALA MARBLE AT CHANDIGARH`, client, sheet title,
  `DATE - 28 AUG 2025`, `DWN BY - MARGE`, `SCALE - NTS`, a `REVISION 01` table, north arrow, and the
  standard notes and reproduction disclaimer;
- a material legend with colour swatches — Ottoman Beige (grey fill) and Emperador Scuro (white);
- grey hatch fills marking every Ottoman Beige area;
- **colour-coded arcs** — yellow, green, orange, blue — distinguishing the slab-cut rings on the
  flooring sheet;
- **36 embedded raster images** (the planter foliage blocks). The DWG holds `IMAGEDEF`, i.e. the images
  are *attached externally*, so those blocks only appear if the image files travel with the DWG;
- hand-placed callouts: `Diameter of circle 7'-8"`, `Slab size 10'-0" x 4'-0"`, `Center Line`.

Also note the md claims verification for **`Shwrm Flrn`** only (§3, "Verified: this reproduces the
client's own `Shwrm Flrn` deliverable"). The 360 document quietly extends the same claim to
**`Wall elevation`**.

Claim geometry and dimension-text parity, then list what is *not* reproduced. The first side-by-side
in the room will otherwise break the claim for you.

### H3 — Two documented limitations a live demo will hit are missing.

md §10.1: 2d1's **layout sheets render as blank title blocks**. md §10 / §3: the Studio produces
**0 walls on 2d1** — mentioned in this document only as a parenthetical in the last row of a long
table. If anyone clicks "Dimensioned Sheets" during the demo they get empty shells. Add one short
"what will look broken in the demo, and why" line. It costs a sentence and buys the credibility the
rest of the document is built on.

### H4 — Likely measurement artefact: the title block and block attributes.

md §10.1 says 2d1's *"title block is unfilled"*, and this document reports only **9 text labels** on
2d1. But both client PDFs — plotted out of this drawing set — show a **fully populated title block**.

The likely explanation is that those values are **block attributes (`ATTRIB` / `ATTDEF`)**, not free
`TEXT` / `MTEXT`, and the harvest is not expanding block attributes. If so: "title block is unfilled"
is false, the 9-label count is understated, and the fix is small — and the same fix would improve the
room-label and stone-call-out harvest that requirement 6 depends on. Verify before publishing either
claim.

---

## Medium and wording

**M1 — Model name.** The document says *"Google's Gemini Nano-Banana model"*. The md says provider
`gemini`, model `gemini-3-pro-image`. "Nano Banana" is the nickname for Gemini 2.5 Flash Image; the
Pro nickname maps to Gemini 3 Pro Image. In a document whose entire selling point is precision, use
the identifier: **Google Gemini (`gemini-3-pro-image`)**. Same correction is still outstanding in md
§10.5, where the deck credits "Higgsfield".

**M2 — Internal contradiction: `TOILET PLAN` vs "zero room names".** §2 says the two **TOILET PLAN**
groups trace 0 rooms each, then two rows later says *"Zero of the 9 text labels … are room names"*.
A reader sees `TOILET` in your own table. The distinction you mean — a *drawing title* versus a *label
inside a closed area* — is real but never stated. One clause fixes it: "the file has drawing titles
like `TOILET PLAN`, but no label sits inside a closed area, which is what the 360 needs."

**M3 — "25% against a 40% floor" is unexplained, and reads generous.** Nobody outside the build team
knows what the 40% floor is or who set it. And 25% is *below* 40%, so it **fails** the threshold —
yet the cell reads "Partial". Write: "25% of walls close. Our own minimum for automatic room tracing
is 40%, so this file fails it."

**M4 — "KF-shaped elevation files"** (§3, Schematic 3D row) is an unexplained codename or a typo.
Replace with plain English.

**M5 — Verdict format is inconsistent.** 2d1 gets a count ("Four of the six requirements are absent");
Stall gets a bare "Not achievable." Give every file the same count so the table is comparable.

**M6 — The file-size comparison is filler.** *"1.34 MB source DWG → 9.95 MB DXF … Roughly twice the
size of 2d1.dwg"* compares one file's DWG against another's DXF, and size says nothing about
360-readiness. (Arithmetically it holds: 1.34 MB is ~2.3× the 574 KB `2d1_2.dwg`.) Drop it, or label
it as scale only.

**M7 — Page 6 is an orphan.** The closing sentence breaks across pages 5→6, leaving page 6 holding one
line. Tighten §4 or the footer so the document ends on page 5.

**M8 — File identity is unconfirmed.** The DWG supplied is **`2d1_2.dwg`** (574 KB, AC1024, saved
2026-07-23 by `mayuresh.yende` in AutoCAD LT 2023). The document attributes its figures to
**`2d1.dwg`**. The client's Wall-elevation PDF carries the internal title `swrm1 (2)`, so "(2)" copies
circulate on their side too. Confirm the 955-entity / 44% / 9-label figures were measured on the same
file you are discussing with the customer — a `_2` revision is exactly where a number quietly stops
matching.

---

## What holds up under checking

Worth knowing what survives scrutiny, because most of it does.

- **Every percentage recomputes.** 420/955 = 43.98% → 44%. 361/2076 = 17.39% → 17%.
  501/4907 = 10.21% → 10%. 2971/4907 = 60.55% → 61%. And the md's 151/4625 = 3.26% → 3.3%.
- **Units claim corroborated externally.** The document says 2d1 has `$INSUNITS = 1` → inches; both
  client sheets state "ALL DIMENSIONS ARE IN FEET AND INCHES". Independent confirmation, exactly as
  the document claims.
- **Stone call-outs corroborated.** `Emperador Scuro` appears verbatim on both client sheets, and
  `Center Line` text exists — matching "centre-line markers".
- **The Stall repeat-footprint arithmetic is internally consistent.** 9 eligible plan groups, 4
  distinct wall signatures, one repeating six times = 6 + 1 + 1 + 1.
- **"Four of the six requirements are absent"** counts correctly for 2d1 against §1's list: heights,
  doors-in-plans, ceiling, room labels.
- One check to run: **`Ottoman Beige`** appears on both client sheets and is the dominant material,
  but is not among the three stone labels you name. Your list is exemplary rather than exhaustive, so
  it may be among the other six — worth confirming it is in the harvest.

## What to keep exactly as it is

- §1's "six requirements → what it looks like in the drawing" table. It converts a refusal into an
  education, which is the only way a refusal survives a sales meeting.
- §4's assisted-not-automatic path. It is the right commercial answer and it is bulk-first, which is
  what makes it credible as work an estimator would actually do.
- The closing "What we should NOT promise" paragraph, and the "measurement pending" convention. This
  is md §9's discipline applied to a document rather than to code.
