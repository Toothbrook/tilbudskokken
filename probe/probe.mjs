import fs from 'node:fs/promises';
const H = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', 'accept-language': 'da-DK,da;q=0.9' };
const out = {};
const page = 'https://shop.rema1000.dk/avisvarer/kod-fisk-fjerkrae';
const html = await (await fetch(page, { headers: H })).text();
await fs.writeFile('probe/page.html', html);
const scripts = [...new Set([...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map(m => new URL(m[1], page).href))];
const inline = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.length > 50);
await fs.writeFile('probe/inline-scripts.txt', inline.map((s, i) => `/* ---- ${i} (${s.length}) ---- */\n${s.slice(0, 6000)}`).join('\n\n'));
const urls = new Set(), paths = new Set();
const scan = t => {
  for (const m of t.matchAll(/https?:\/\/[a-z0-9.-]*(?:rema1000|algolia|algolianet|tjek|digital)[a-z0-9.-]*[^\s"'`)\\]*/gi)) urls.add(m[0].slice(0, 200));
  for (const m of t.matchAll(/["'`](\/api\/[^"'`\s]{1,120})["'`]/g)) paths.add(m[1]);
  for (const m of t.matchAll(/["'`]([^"'`\s]{0,60}(?:avisvare|campaign|offer|advertised|products?\?|search\?)[^"'`\s]{0,80})["'`]/gi)) paths.add(m[1]);
};
scan(html); inline.forEach(scan);
const seenJs = new Set();
async function crawl(u, depth) {
  if (seenJs.has(u) || seenJs.size > 80) return; seenJs.add(u);
  try {
    const t = await (await fetch(u, { headers: H })).text(); scan(t);
    if (/algolia/i.test(t)) out.algoliaIn = [...(out.algoliaIn || []), u];
    const m = t.match(/.{0,300}(?:avisvare|isAdvertised|is_advertised).{0,300}/i); if (m) (out.snippets ||= []).push({ u, s: m[0] });
    if (depth < 2) for (const mm of t.matchAll(/["'`](\.{0,2}\/?[^"'`\s]*\.js)["'`]/g)) { try { await crawl(new URL(mm[1], u).href, depth + 1); } catch {} }
  } catch (e) { (out.errors ||= []).push(`${u}: ${e.message}`); }
}
for (const s of scripts) await crawl(s, 0);
out.scripts = scripts; out.jsScanned = seenJs.size; out.urls = [...urls].sort(); out.paths = [...paths].sort();
out.htmlLength = html.length; out.anchorCount = (html.match(/href="[^"]*\/varer\//g) || []).length;
out.dataHints = [...html.matchAll(/.{0,120}(?:__sveltekit|__NUXT__|__NEXT_DATA__|data-sveltekit|"products"|totalCount|"total").{0,200}/g)].slice(0, 15).map(m => m[0]);
await fs.writeFile('probe/findings.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify({ urls: out.urls, paths: out.paths.slice(0, 80), algoliaIn: out.algoliaIn }, null, 1));
