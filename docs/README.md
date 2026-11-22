# Study guide PDF

`AWS-Cloud-Engineer-Interview-Study-Guide.pdf` is generated from the app's own
content in `src/data/categories/`, so it stays in step with the course.

Rebuild it after changing topics:

```bash
node scripts/build-study-pdf-extract.mjs <workdir>   # classify topics
node scripts/build-study-pdf.mjs <workdir>           # render HTML + outline plan
chrome --headless --no-pdf-header-footer \
  --print-to-pdf=<workdir>/guide-raw.pdf file:///<workdir>/guide.html
python scripts/build-study-pdf-finish.py <workdir> docs/AWS-Cloud-Engineer-Interview-Study-Guide.pdf
```

Needs `marked` (npm) and `pypdf` + `reportlab` (pip).

Console walkthroughs are filtered out: a topic is dropped when console verbs
outweigh explanation, because interviews test mechanisms rather than click
paths. The thresholds live in `build-study-pdf-extract.mjs`.

## Rapid revision notes

`AWS-Interview-Rapid-Revision-Notes.pdf` is the 48-page cram sheet — the same
corpus reduced to tables, limits and gotchas, sized for one ~3-hour sitting.

```bash
node scripts/build-revision-notes-extract.mjs <workdir>   # same classifier as the big guide
node scripts/build-revision-notes.mjs <workdir>           # mine tables, gotchas, numeric facts
node scripts/build-revision-notes-render.mjs <workdir>    # dense HTML + outline plan
chrome --headless --no-pdf-header-footer \
  --print-to-pdf=<workdir>/cram-raw.pdf file:///<workdir>/cram.html
cp <workdir>/cram-raw.pdf <workdir>/guide-raw.pdf
cp <workdir>/cram-outline.json <workdir>/outline.json
python scripts/build-study-pdf-finish.py <workdir> docs/AWS-Interview-Rapid-Revision-Notes.pdf
```

Anything a working engineer would already know is cut: titles like "What is…"
and "Introduction" are dropped outright, and a line only survives if it carries
a figure or an absolute ("cannot", "default", "maximum") and reads as a
standalone fact. Narrative set-ups and console paths are rejected.
