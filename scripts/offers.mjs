// Fetches this week's REMA 1000 offers ("avisvarer") and normalises them.
// Primary source: REMA's product API (the same one shop.rema1000.dk uses), filtered on the
// "Avisvare" label. Fallbacks: the server-rendered avisvarer pages, then the public Tjek API.

const BASE = 'https://shop.rema1000.dk';
const API = 'https://api.digital.rema1000.dk/api';
const AVISVARE_LABEL = 9001;
export const FOOD_CATS = ['kod-fisk-fjerkrae', 'frugt-gront', 'mejeri', 'ost-mv', 'brod-bavinchi', 'kol', 'frost', 'kolonial'];
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'accept-language': 'da-DK,da;q=0.9,en;q=0.8',
  accept: 'text/html,application/xhtml+xml',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getText(url) {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.text();
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
export function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z#0-9]+);/gi, (m, n) => ENT[n] ?? m);
}
export const stripTags = html => decode(html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// ---- price parsing --------------------------------------------------------
// The shop renders "35" "00" "87.50 per kg" as separate elements. Depending on how the
// HTML is flattened that arrives as "35 00 87.50 per kg" or glued "350087.50 per kg".
function perQty(qty, unit, per) {
  if (per === 'stk') return unit === 'stk' ? qty : 1;
  return qty / 1000; // g -> kg, ml -> l
}
export function parsePrice(pre, qty, unit, per) {
  let m = pre.match(/(\d+)\s+(\d{2})\s+(\d+[.,]\d{2})\s*$/) || pre.match(/(\d+)[.,](\d{2})\s+(\d+[.,]\d{2})\s*$/);
  if (m) return { price: +`${m[1]}.${m[2]}`, unitPrice: +m[3].replace(',', '.') };
  m = pre.match(/(\d+)[.,](\d{2})\s*$/);
  if (!m) return null;
  const digits = m[1], dec = m[2], q = perQty(qty, unit, per);
  let best = null;
  for (let i = 1; i <= digits.length - 3; i++) {
    const kr = digits.slice(0, i), ore = digits.slice(i, i + 2), uInt = digits.slice(i + 2);
    if (uInt.length > 1 && uInt[0] === '0') continue;
    const price = +`${kr}.${ore}`, unitPrice = +`${uInt}.${dec}`;
    if (!unitPrice) continue;
    const err = Math.abs(price / q - unitPrice) / unitPrice;
    if (!best || err < best.err) best = { price, unitPrice, err };
  }
  return best && best.err < 0.08 ? { price: best.price, unitPrice: best.unitPrice } : null;
}

// ---- product text parsing -------------------------------------------------
const STOP = /\s(?:Dansk|Økologi|Nøglehul|Køl|Frost|Butik|Bedre|Anbefalet|MSC|ASC|Maks\.|Fuldkorn|Laktose|REMA1000|Gram slot|Tilføj)\b/;
export function parseProduct(href, rawText) {
  const path = href.replace(/^https?:\/\/[^/]+/, '');
  const pm = path.match(/\/varer\/([^/]+)\/([^/]+)\/(\d+)-([^/?#]+)/);
  if (!pm) return null;
  let t = rawText.replace(/\s+/g, ' ').trim().replace(/^Tilføj til favoritter\s*/i, '').replace(/^Avisvare\s*/i, '');
  const perM = [...t.matchAll(/per\s*(kg|ltr|stk)\b/gi)].pop();
  if (!perM) return null;
  const per = perM[1].toLowerCase();
  const sm = t.match(/(\d+(?:[.,]\d+)?)\s*(GR|KG|ML|CL|LTR|STK|L)\.?(?![A-ZÆØÅa-zæøå])/);
  if (!sm || sm.index > perM.index) return null;
  const name = t.slice(0, sm.index).trim();
  if (!name) return null;
  const n = parseFloat(sm[1].replace(',', '.')), u = sm[2];
  const [qty, unit] = u === 'GR' ? [n, 'g'] : u === 'KG' ? [n * 1000, 'g'] : u === 'ML' ? [n, 'ml'] : u === 'CL' ? [n * 10, 'ml']
    : (u === 'LTR' || u === 'L') ? [n * 1000, 'ml'] : [n, 'stk'];
  let rest = t.slice(sm.index + sm[0].length, perM.index);
  let desc = '';
  const dm = rest.match(/^\s*\/\s*(.*)$/);
  if (dm) { desc = dm[1]; const s = desc.search(STOP); if (s >= 0) desc = desc.slice(0, s); desc = desc.replace(/\s+\d+[.,]\d{2}\s*$/, '').replace(/\s\d+\s\d{2}$/, '').trim(); }
  const pr = parsePrice(t.slice(0, perM.index).trimEnd(), qty, unit, per);
  if (!pr) return null;
  return { id: pm[3], name, desc, qty: Math.round(qty * 100) / 100, unit, price: pr.price, unitPrice: pr.unitPrice, per,
    cat: pm[1], sub: pm[2], url: BASE + path };
}

export function extractProducts(html) {
  const out = [];
  const re = /<a\b[^>]*href="([^"]*\/varer\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    const text = stripTags(m[2]);
    if (!/per\s*(kg|ltr|stk)/i.test(text)) continue;
    const p = parseProduct(decode(m[1]), text);
    if (p) out.push(p);
  }
  return out;
}

// ---- week detection -------------------------------------------------------
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export function isoWeek(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return { week: Math.ceil(((t - y) / 864e5 + 1) / 7), year: t.getUTCFullYear() };
}
export function computedWeek(now = new Date()) {
  const sun = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
  const mon = new Date(sun.getTime() + 864e5), sat = new Date(sun.getTime() + 6 * 864e5);
  return { ...isoWeek(mon), validFrom: iso(sun), validTo: iso(sat) };
}
export function parseWeek(html, now = new Date()) {
  const text = stripTags(html);
  const found = [...text.matchAll(/Uge\s*(\d{1,2})\s+(\d{2})\.(\d{2})\.(\d{4})\s*[-–]\s*(\d{2})\.(\d{2})\.(\d{4})/g)]
    .map(m => ({ week: +m[1], year: +m[4], validFrom: `${m[4]}-${m[3]}-${m[2]}`, validTo: `${m[7]}-${m[6]}-${m[5]}` }));
  const today = iso(now);
  return found.find(w => w.validFrom <= today && today <= w.validTo)
    || found.filter(w => w.validFrom <= today).sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0]
    || computedWeek(now);
}


// ---- REMA product API ----------------------------------------------------------
function parseSize(str) {
  const sm = (str || '').match(/(\d+(?:[.,]\d+)?)\s*(GR|KG|ML|CL|LTR|STK|L)\.?(?![A-ZÆØÅa-zæøå])/i);
  if (!sm) return null;
  const n = parseFloat(sm[1].replace(',', '.')), u = sm[2].toUpperCase();
  return u === 'GR' ? [n, 'g'] : u === 'KG' ? [n * 1000, 'g'] : u === 'ML' ? [n, 'ml'] : u === 'CL' ? [n * 10, 'ml']
    : (u === 'LTR' || u === 'L') ? [n * 1000, 'ml'] : [n, 'stk'];
}
// mode 'offer': the advertised price. mode 'regular': the normal shelf price valid today.
export function fromApi(p, mode = 'offer', now = new Date()) {
  const prices = Array.isArray(p.prices) ? p.prices : [];
  let pr;
  if (mode === 'offer') pr = prices.find(x => x.is_advertised) || prices.find(x => x.is_campaign);
  else {
    const today = iso(now), d = s => (s ? String(s).slice(0, 10) : '');
    const normal = prices.filter(x => !x.is_advertised && !x.is_campaign && x.price);
    pr = normal.find(x => (!x.starting_at || d(x.starting_at) <= today) && (!x.ending_at || d(x.ending_at) >= today))
      || normal.sort((a, b) => String(a.starting_at).localeCompare(String(b.starting_at)))[0];
  }
  if (!pr || !pr.price) return null;
  const [sizePart, ...rest] = String(p.underline || '').split('/');
  const per = ({ kg: 'kg', l: 'ltr', ltr: 'ltr', stk: 'stk' })[String(pr.compare_unit || '').toLowerCase()] || 'stk';
  let size = parseSize(sizePart) || parseSize(p.name);
  if (!size) size = per === 'stk' ? [1, 'stk']
    : [Math.round(pr.price / (pr.compare_unit_price || pr.price) * 1000), per === 'kg' ? 'g' : 'ml'];
  const [qty, unit] = size;
  const day = s => (s ? String(s).slice(0, 10) : '');
  return { id: String(p.id), name: String(p.name || '').trim(), desc: rest.join('/').trim(), qty: Math.round(qty * 100) / 100, unit,
    price: +pr.price, unitPrice: +(pr.compare_unit_price || 0) || Math.round(pr.price / perQty(qty, unit, per) * 100) / 100, per,
    cat: p.department?.slug || '', sub: p.category?.slug || '', url: `${BASE}/varer/${p.id}`,
    from: day(pr.starting_at), to: day(pr.ending_at), ...(p.is_weight_item ? { loose: true } : {}) };
}

// Every food product with its normal shelf price, so non-offer ingredients can be priced too.
export async function scrapeCatalogue(log = console.log, now = new Date()) {
  const H = { ...HEADERS, accept: 'application/json', origin: BASE, referer: `${BASE}/` };
  const getJson = async url => { const r = await fetch(url, { headers: H }); if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return r.json(); };
  let deps = [];
  try {
    const j = await getJson(`${API}/v3/departments?per_page=100`);
    deps = (j.data || []).filter(d => FOOD_CATS.includes(d.slug)).map(d => ({ id: d.id, slug: d.slug }));
  } catch (e) { log(`  departments: ${e.message}`); }
  const runs = deps.length ? deps.map(d => `filter%5Bdepartments%5D=${d.id}&`) : [''];
  const raw = [];
  for (const f of runs) {
    for (let page = 1; page <= 60; page++) {
      const j = await getJson(`${API}/search/products?${f}per_page=100&page=${page}&sort=department`);
      const data = Array.isArray(j.data) ? j.data : [];
      raw.push(...data);
      const pg = j.meta?.pagination || j.meta || {};
      if (!data.length || (pg.last_page && page >= pg.last_page)) break;
      await sleep(200);
    }
  }
  const seen = new Set(), products = [];
  for (const p of raw) {
    if (seen.has(p.id)) continue; seen.add(p.id);
    const o = fromApi(p, 'regular', now);
    if (o && FOOD_CATS.includes(o.cat)) products.push(o);
  }
  log(`  catalogue: ${raw.length} rows, ${products.length} food products priced (${deps.length} departments)`);
  return products;
}

export async function scrapeApi(log = console.log, now = new Date()) {
  const H = { ...HEADERS, accept: 'application/json', origin: BASE, referer: `${BASE}/` };
  const raw = [];
  let perPage = 100;
  for (let page = 1; page <= 40; page++) {
    const url = `${API}/search/products?filter%5Blabels%5D=${AVISVARE_LABEL}&per_page=${perPage}&page=${page}&sort=department`;
    const r = await fetch(url, { headers: H });
    if (!r.ok && page === 1 && perPage !== 24 && r.status >= 400 && r.status < 500) { perPage = 24; page = 0; continue; }
    if (!r.ok) throw new Error(`API HTTP ${r.status}`);
    const j = await r.json();
    const data = Array.isArray(j.data) ? j.data : [];
    raw.push(...data);
    const pg = j.meta?.pagination || j.meta || {};
    log(`  API page ${page}/${pg.last_page ?? '?'}: ${data.length} products`);
    if (!data.length || (pg.last_page && page >= pg.last_page)) break;
    await sleep(250);
  }
  const all = raw.map(fromApi).filter(Boolean);
  const today = iso(now), tomorrow = iso(new Date(now.getTime() + 864e5));
  const live = all.filter(o => (!o.from || o.from <= tomorrow) && (!o.to || o.to >= today));
  // The week's main avis is the most common start date among live offers.
  const count = {};
  live.forEach(o => { if (o.from) count[`${o.from}|${o.to}`] = (count[`${o.from}|${o.to}`] || 0) + 1; });
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  let week = computedWeek(now);
  if (top) { const [from, to] = top[0].split('|'); const mon = new Date(Date.parse(from) + 864e5);
    week = { ...isoWeek(mon), validFrom: from, validTo: to || week.validTo }; }
  const cats = {}; live.forEach(o => cats[o.cat] = (cats[o.cat] || 0) + 1);
  log(`  API: ${raw.length} products, ${live.length} live offers; departments ${JSON.stringify(cats)}`);
  return { offers: live.filter(o => FOOD_CATS.includes(o.cat)), week, source: 'REMA 1000 product API' };
}

// ---- scrapers ---------------------------------------------------------------
export async function scrapeRema(log = console.log) {
  const main = await getText(`${BASE}/avisvarer`);
  const week = parseWeek(main);
  const seen = new Map();
  for (const p of extractProducts(main)) seen.set(p.id, p);
  for (const cat of FOOD_CATS) {
    for (let page = 1; page <= 6; page++) {
      await sleep(400);
      const url = `${BASE}/avisvarer/${cat}${page > 1 ? `?page=${page}` : ''}`;
      let html;
      try { html = await getText(url); } catch (e) { log(`  ${e.message}`); break; }
      let added = 0;
      for (const p of extractProducts(html)) if (!seen.has(p.id)) { seen.set(p.id, p); added++; }
      log(`  ${cat} page ${page}: +${added}`);
      if (!added) break;
    }
  }
  return { offers: [...seen.values()].filter(o => FOOD_CATS.includes(o.cat)), week, source: 'shop.rema1000.dk' };
}

export async function scrapeTjek(log = console.log) {
  const H = { accept: 'application/json', 'user-agent': HEADERS['user-agent'] };
  const dealers = await (await fetch('https://squid-api.tjek.com/v2/dealers?country_id=DK&limit=100', { headers: H })).json();
  const d = Array.isArray(dealers) && dealers.find(x => /^rema\s*1000/i.test(x.name));
  if (!d) throw new Error('REMA 1000 not found on Tjek');
  const raw = [];
  for (let off = 0; off < 1500; off += 100) {
    const r = await fetch(`https://squid-api.tjek.com/v2/offers?dealer_ids=${d.id}&limit=100&offset=${off}`, { headers: H });
    if (!r.ok) throw new Error(`Tjek HTTP ${r.status}`);
    const arr = await r.json();
    raw.push(...arr);
    if (arr.length < 100) break;
    await sleep(300);
  }
  log(`  Tjek: ${raw.length} offers`);
  const UNIT = { g: [1, 'g'], kg: [1000, 'g'], ml: [1, 'ml'], cl: [10, 'ml'], l: [1000, 'ml'], pcs: [1, 'stk'] };
  const offers = raw.map(o => {
    const sym = o.quantity?.unit?.symbol, [mul, unit] = UNIT[sym] || [1, 'stk'];
    const qty = (o.quantity?.size?.from || 1) * mul, price = o.pricing?.price;
    if (!price) return null;
    const per = unit === 'stk' ? 'stk' : unit === 'g' ? 'kg' : 'ltr';
    return { id: o.id, name: (o.heading || '').toUpperCase(), desc: (o.description || '').slice(0, 60), qty, unit, price,
      unitPrice: Math.round(price / perQty(qty, unit, per) * 100) / 100, per, cat: '*', sub: '', url: '' };
  }).filter(Boolean);
  const from = raw.map(o => o.run_from).filter(Boolean).sort()[0];
  const week = from ? computedWeek(new Date(from)) : computedWeek();
  return { offers, week, source: 'Tjek / eTilbudsavis' };
}
