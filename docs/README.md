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
