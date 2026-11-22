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

## Hands-on lab manual

`AWS-Hands-On-Lab-Manual.pdf` is the practical companion — 203 pages, 163 labs.
Where the other two documents strip click-paths out, this one keeps them.

```bash
node scripts/build-revision-notes-extract.mjs <workdir>  # shared classifier
node scripts/build-lab-manual.mjs <workdir>              # select labs, order multi-part builds
node scripts/build-lab-manual-render.mjs <workdir>       # manual HTML + outline plan
chrome --headless --no-pdf-header-footer \
  --print-to-pdf=<workdir>/labs-raw.pdf file:///<workdir>/labs.html
cp <workdir>/labs-raw.pdf <workdir>/guide-raw.pdf
cp <workdir>/labs-outline.json <workdir>/outline.json
python scripts/build-study-pdf-finish.py <workdir> docs/AWS-Hands-On-Lab-Manual.pdf
```

A topic is a lab if its title says so, or if it tells you to *do* things.
Counting numbered lines alone pulled in explanatory topics ("1. Fully managed.
2. Deep AWS integration…"), so every other rule also requires imperative verbs.
Multi-part builds are detected across the whole corpus and kept whole, so a
step that happens to be light on instructions cannot leave a hole mid-build.

## Project interview preparation

`AWS-Project-Interview-Preparation.pdf` is for a specific student, built from
ten resume bullets. Sources live in `scripts/interview-prep/`.

```bash
node scripts/interview-prep/build.mjs <workdir>
chrome --headless --no-pdf-header-footer \
  --print-to-pdf=<workdir>/interview-raw.pdf file:///<workdir>/interview.html
cp <workdir>/interview-raw.pdf <workdir>/guide-raw.pdf
cp <workdir>/interview-outline.json <workdir>/outline.json
python scripts/build-study-pdf-finish.py <workdir> \
  docs/AWS-Project-Interview-Preparation.pdf "AWS Project Interview Preparation"
```

`diagram.mjs` is a small declarative architecture renderer — lanes become
columns, nodes stack, edges route orthogonally, and anything spanning more than
one lane is routed along a bus beneath the boxes so it does not cut through
them. Edit `projects.mjs` to correct the reconstructed detail; the diagrams
regenerate from the same data.

Note that the technical detail in this document is reconstructed from one-line
bullets, which the document states prominently on page 2. It is a rehearsal
script, not a record.
