"""Stamp page numbers onto the rendered guide and build a clickable outline.

Chrome gives correct pagination but no footer and no bookmarks. Page positions
are recovered by matching each heading against the extracted text of each page,
which is reliable here because every chapter opener and topic title is unique.
"""
import io
import json
import re
import sys

from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

SP = sys.argv[1]
RAW = f"{SP}/guide-raw.pdf"
OUT = sys.argv[2]

with open(f"{SP}/outline.json", encoding="utf-8") as fh:
    plan = json.load(fh)

reader = PdfReader(RAW)
n_pages = len(reader.pages)
print(f"pages: {n_pages}")


def norm(s: str) -> str:
    """Collapse to comparable letters: PDF extraction loses dashes and spacing."""
    return re.sub(r"[^a-z0-9]+", "", s.lower())


print("extracting page text ...")
page_norm = []
for i, page in enumerate(reader.pages):
    page_norm.append(norm(page.extract_text() or ""))
    if (i + 1) % 150 == 0:
        print(f"  {i + 1}/{n_pages}")

# Front matter sits before the first chapter; everything after is searched in
# document order so a title that recurs later cannot pull a bookmark backwards.
def find_page(needle: str, start: int) -> int:
    key = norm(needle)[:46]
    if not key:
        return -1
    for i in range(start, n_pages):
        if key in page_norm[i]:
            return i
    return -1


# A contents page names most chapters at once, so it out-competes the real
# heading on every substring search. Identify those pages and skip them.
all_names = [norm(c["name"]) for c in plan["chapters"] if norm(c["name"])]
contents_pages = {
    i for i, pn in enumerate(page_norm)
    if sum(1 for k in all_names if k in pn) >= max(3, len(all_names) // 2)
}
print("contents pages skipped:", sorted(i + 1 for i in contents_pages) or "none")

cursor = 0
chapters = []
for ch in plan["chapters"]:
    ch_key = norm("Chapter " + str(ch["num"])) + norm(ch["name"])
    page = -1
    for i in range(cursor, n_pages):
        if ch_key in page_norm[i]:
            page = i
            break
    if page < 0:
        # A contents page lists every chapter name, so a plain substring search
        # lands there instead of on the chapter. Require the name at the very
        # top of the page, which is where a heading sits.
        key = norm(ch["name"])
        for i in range(cursor, n_pages):
            if i in contents_pages:
                continue
            if key and key in page_norm[i][:90]:
                page = i
                break
    if page < 0:
        page = find_page(ch["name"], cursor)
    if page < 0:
        page = cursor
    cursor = page
    topics = []
    tcur = page
    for t in ch["topics"]:
        tp = find_page(t, tcur)
        if tp >= 0:
            topics.append((t, tp))
            tcur = tp
    chapters.append({"name": ch["name"], "num": ch["num"], "page": page, "topics": topics})
    print(f"  ch{ch['num']:>2} p{page + 1:<4} {ch['name'][:42]:44} topics located {len(topics)}/{len(ch['topics'])}")

# ── Footer overlay ────────────────────────────────────────────────────────
# Roman-free: front matter is unnumbered, body numbers from 1 so the printed
# number matches what a student says out loud ("page 212").
first_body = chapters[0]["page"] if chapters else 0
W, H = A4

print("stamping page numbers ...")
# One reportlab document for every footer, not one per page: a fresh canvas per
# page re-embeds the font each time, which inflated the file to 41 MB.
buf = io.BytesIO()
c = canvas.Canvas(buf, pagesize=(W, H))
for i in range(n_pages):
    if i >= first_body:
        c.setFont("Times-Roman", 8.5)
        c.setFillColorRGB(0.42, 0.41, 0.39)
        c.drawCentredString(W / 2.0, 24, str(i - first_body + 1))
        c.setFont("Times-Italic", 7.5)
        c.drawString(46, 24, "AWS Cloud Engineer — Interview Study Guide")
    c.showPage()
c.save()
buf.seek(0)
overlay = PdfReader(buf)

writer = PdfWriter()
for i, page in enumerate(reader.pages):
    if i >= first_body:
        page.merge_page(overlay.pages[i])
    writer.add_page(page)

# ── Outline ───────────────────────────────────────────────────────────────
print("building outline ...")
for ch in chapters:
    parent = writer.add_outline_item(f"{ch['num']}. {ch['name']}", ch["page"])
    for title, pg in ch["topics"]:
        writer.add_outline_item(title[:110], pg, parent=parent)

writer.add_metadata(
    {
        "/Title": "AWS Cloud Engineer — Interview Study Guide",
        "/Subject": "Comprehensive AWS interview preparation and study reference",
        "/Keywords": "AWS, cloud engineer, interview, SAA-C03, study guide",
        "/Creator": "AWS Learn",
    }
)
writer.page_mode = "/UseOutlines"

print("compressing ...")
for pg in writer.pages:
    pg.compress_content_streams()
writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)

with open(OUT, "wb") as fh:
    writer.write(fh)

located = sum(len(c["topics"]) for c in chapters)
planned = sum(len(c["topics"]) for c in plan["chapters"])
print(f"\nwrote {OUT}")
print(f"bookmarks: {len(chapters)} chapters + {located}/{planned} topics")
print(f"body pages numbered from page {first_body + 1} of the file")
