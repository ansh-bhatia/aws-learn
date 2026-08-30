// Lexical retrieval over the study corpus. No embeddings, no vector store —
// BM25 against a build-time inverted index (see scripts/build-rag-index.mjs)
// served as a static asset.

const STOP = new Set(
  `a an and are as at be by for from has have how i in is it its of on or that the
   to was what when where which who why will with you your can do does if not this
   these those there their them then than so such but into over under about above`
    .split(/\s+/)
    .filter(Boolean)
);

// Must match the tokenizer used at build time or terms won't line up.
export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9.\-\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((t) => t.length > 1 && t.length < 40 && !STOP.has(t));
}

// Fetched once per warm instance, not per request.
let indexPromise = null;

function loadIndex(origin) {
  if (!indexPromise) {
    indexPromise = fetch(`${origin}/rag/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`index ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        indexPromise = null; // let a later request retry rather than caching the failure
        throw err;
      });
  }
  return indexPromise;
}

const K1 = 1.5;
const B = 0.75;

// A document has to match this share of the question's distinct terms before
// it counts. Without it an off-topic question still scores: "bake a chocolate
// cake" matches a topic containing "bake time window" on that one word.
const MIN_TERM_COVERAGE = 0.45;

export async function searchCorpus(origin, query, limit = 4) {
  const index = await loadIndex(origin);
  const termIdx = new Map(index.terms.map((t, i) => [t, i]));

  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0) return [];

  // Coverage is judged only on terms that actually carry meaning. A question
  // phrased naturally ("why does my ... only give me ...") is mostly filler,
  // and counting those against the denominator makes real matches look weak.
  // Rarity is the test rather than a hand-maintained stopword list.
  const significant = queryTerms.filter((t) => {
    const ti = termIdx.get(t);
    return ti !== undefined && index.df[ti] / index.docCount < 0.25;
  });

  // If almost none of the question's vocabulary exists in the corpus, it isn't
  // about this material. Judging coverage on the one word that happened to
  // match would score it 100% — "bake a chocolate cake" knows only "bake",
  // which lands on a blue/green deployment topic about bake time.
  if (queryTerms.length >= 3 && significant.length / queryTerms.length < 0.4) return [];

  const coverageTerms = significant.length ? significant : queryTerms;

  const scores = new Float64Array(index.docCount);
  const matched = new Uint16Array(index.docCount); // distinct significant terms hit
  const coverageSet = new Set(coverageTerms);

  for (const term of queryTerms) {
    const ti = termIdx.get(term);
    if (ti === undefined) continue; // absent from the corpus entirely
    const idf = Math.log(1 + (index.docCount - index.df[ti] + 0.5) / (index.df[ti] + 0.5));
    const post = index.postings[ti];
    const counts = coverageSet.has(term);
    for (let p = 0; p < post.length; p += 2) {
      const di = post[p];
      const tf = post[p + 1];
      const norm = 1 - B + (B * index.docs[di].len) / index.avgLen;
      scores[di] += idf * ((tf * (K1 + 1)) / (tf + K1 * norm));
      if (counts) matched[di] += 1;
    }
  }

  // A term in the title is a much stronger signal than one buried in the body.
  for (let di = 0; di < index.docCount; di++) {
    if (scores[di] <= 0) continue;
    const title = new Set(tokenize(index.docs[di].title));
    let hits = 0;
    for (const t of queryTerms) if (title.has(t)) hits++;
    if (hits) scores[di] *= 1 + 0.35 * hits;
  }

  // A ratio alone isn't enough: with two meaningful terms, matching just one
  // clears 45%. One shared word is a coincidence, not a topic match — "center
  // a div in CSS" hits "IAM Identity Center" on "center" and nothing else.
  const minMatches = coverageTerms.length >= 2 ? 2 : 1;

  const ranked = [];
  for (let i = 0; i < index.docCount; i++) {
    if (
      scores[i] > 0 &&
      matched[i] >= minMatches &&
      matched[i] / coverageTerms.length >= MIN_TERM_COVERAGE
    ) {
      ranked.push({ i, score: scores[i] });
    }
  }
  if (!ranked.length) return []; // corpus doesn't cover it — let web search answer
  ranked.sort((a, b) => b.score - a.score);

  const top = ranked.slice(0, limit).filter((r) => r.score > ranked[0].score * 0.35);
  return top.map((r) => ({ ...index.docs[r.i], score: Number(r.score.toFixed(3)) }));
}

// Full topic bodies — the point is that the model reads the whole lesson, not
// a summary of it.
export async function fetchTopics(origin, hits) {
  const results = await Promise.all(
    hits.map(async (h) => {
      try {
        const r = await fetch(`${origin}/rag/topics/${encodeURIComponent(h.id)}.json`);
        if (!r.ok) return null;
        const doc = await r.json();
        return { ...h, content: doc.content };
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}
