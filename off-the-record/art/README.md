# Location stills — anime backdrops

The five films can use **real anime-style stills** instead of the built-in SVG
scenes. `index.html` already points `ART_IMG` at the filenames below, with a safe
fallback: **until a file exists here, the film falls back to the hand-built SVG
scene** (the `<img>` simply fails to load and is removed). Drop the JPGs in and
they appear automatically — no code change needed.

## How to add them

1. Open each Canva design below (they were generated into **your** Canva account).
2. Pick the version you like best — the "main" link is the one already promoted to
   a design; the **alternates** are the other AI variations from the same prompt.
3. In Canva: **Share → Download → JPG** (landscape/wide is ideal). 
4. Save each file into this `art/` folder with the **exact filename** in the table.
5. Commit the files. Done — the booth now shows the photos.

> Why you have to download them: this build environment's network policy blocks
> Canva's image/download hosts (`design.canva.ai`, `export-download.canva.com`
> return 403), so the agent can generate the designs but can't pull the pixels in
> to commit them. Your browser isn't behind that proxy, so the download works for
> you.

Recommended export: **1600×1000-ish, JPG, ~85% quality** (keeps the page light).
Filenames are referenced by `ART_IMG` in `index.html`.

## The five designs

### `hampi.jpg` — Golden Dawn Over Hampi's Ruins
- Main: https://www.canva.com/d/uGEQrcxtkh8UiZQ (edit: https://www.canva.com/d/IEtc7UeR7Hs-4Ho)
- Alternates: https://www.canva.com/d/aeM4T9jdIDpzkBE · https://www.canva.com/d/oZm7T0beCPhHiyU · https://www.canva.com/d/XPv8BlY3rVclHcS

### `patiala.jpg` — Sunset Landscape of Patiala Palace
- Main: https://www.canva.com/d/-vjq9H1x4NEqQEb (edit: https://www.canva.com/d/_uId1oqlRmPFzQ4)
- Alternates: https://www.canva.com/d/A1tTJGGpDztZkBX · https://www.canva.com/d/COF6O9FgtNZwiZJ · https://www.canva.com/d/MSR__ibLxGiajb1

### `somnath.jpg` — Somnath Temple at Dusk with Indigo Sky
- Main: https://www.canva.com/d/SHKIm4BS7oX2koD (edit: https://www.canva.com/d/GWgpazh1cfKkTL5)
- Alternates: https://www.canva.com/d/s6q4lnVcox8TEqR · https://www.canva.com/d/0lb3-sSH3nmRvhr · https://www.canva.com/d/XFbfzKoy8RbOSE5

### `haridwar.jpg` — Luminous Ganga Aarti at Night
- Main: https://www.canva.com/d/DITz0z824dWD9qq (edit: https://www.canva.com/d/LlQAMi7URCq_gPB)
- Alternates: https://www.canva.com/d/wIqy3ltn0d-lbUM · https://www.canva.com/d/ovHCndXiQamSoU5 · https://www.canva.com/d/PeA9X4Momr2XCyb

### `andamans.jpg` — Tranquil Andaman Beach at Night with Bioluminescence
- Main: https://www.canva.com/d/Eil9DRifIKc6ZkL (edit: https://www.canva.com/d/1EAQ51klhdupahs)
- Alternates: https://www.canva.com/d/eMSH19coOlySSB4 · https://www.canva.com/d/XhHnWGM29kCmVYb · https://www.canva.com/d/TgF_qXFbkz1gfu2

## Don't want photos after all?
Set `ART_IMG = {}` in `index.html` (or delete the entries) and the films use the
SVG scenes everywhere.
