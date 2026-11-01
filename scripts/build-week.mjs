#!/usr/bin/env node
// Builds data/week.json: fetches this week's REMA 1000 offers, matches them to the
// ingredient catalogue, and picks the dinners/breakfasts/lunches with the most on offer.
//
//   node scripts/build-week.mjs                      # live: scrape REMA (fallback Tjek)
//   node scripts/build-week.mjs --offers file.json   # offline: use a saved offers file
//   node scripts/build-week.mjs --save-offers x.json # also store the raw offers
import fs from 'node:fs/promises';
import path from 'node:path';
import { INGREDIENTS, RECIPES } from './recipes.mjs';
import { scrapeRema, scrapeTjek, parseProduct, computedWeek } from './offers.mjs';

const args = process.argv.slice(2);
const arg = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const OUT = arg('--out') || 'data/week.json';
const PICK = { dinner: 4, breakfast: 3, lunch: 3 };
const DEFAULT_PORTIONS = { breakfast: 2, lunch: 2 };
const WEIGHT = { protein: 3, dairy: 1.5, grain: 1.5, produce: 1, pantry: 0.7, staple: 0 };

// ---------- 1. offers
let offers, week, source;
if (arg('--offers')) {
  const fx = JSON.parse(await fs.readFile(arg('--offers'), 'utf8'));
  offers = fx.products ? fx.products.map(p => parseProduct(p.href, p.text)).filter(Boolean) : fx.offers;
  week = fx.week || computedWeek(); source = fx.source || 'shop.rema1000.dk';
} else {
  try {
    ({ offers, week, source } = await scrapeRema());
    console.log(`REMA shop: ${offers.length} food offers`);
  } catch (e) { console.warn(`REMA shop failed: ${e.message}`); offers = []; }
  if (offers.length < 15) {
    try { const t = await scrapeTjek(); if (t.offers.length > offers.length) ({ offers, week, source } = t); }
    catch (e) { console.warn(`Tjek fallback failed: ${e.message}`); }
  }
}
if (!offers || offers.length < 15) {
  console.error(`Only ${offers?.length || 0} offers found. Keeping the previous plan.`);
  process.exit(1);
}
if (arg('--save-offers')) await fs.writeFile(arg('--save-offers'), JSON.stringify({ week, source, offers }, null, 1));

// ---------- 2. match offers to ingredients
const textOf = o => `${o.name} ${o.desc}`.toUpperCase();
const sentence = s => { const l = s.toLowerCase(); return l.charAt(0).toUpperCase() + l.slice(1); };
const sizeLabel = (qty, unit) => unit === 'stk' ? `${qty} stk` : qty >= 1000
  ? `${String(+(qty / 1000).toFixed(2)).replace('.', ',')} ${unit === 'g' ? 'kg' : 'l'}` : `${qty} ${unit}`;

function packGrams(def, o) {
  if (o.unit !== 'stk') return o.qty;
  return o.qty * (def.each || def.stkG || 500);
}
function bestOffer(key) {
  const def = INGREDIENTS[key];
  if (!def.re) return null;
  const hits = offers.filter(o => {
    if (def.cats && o.cat !== '*' && !def.cats.includes(o.cat)) return false;
    if (def.subs && o.cat !== '*' && !def.subs.includes(o.sub)) return false;
    const t = textOf(o);
    return def.re.test(t) && !(def.ex && def.ex.test(t));
  });
  if (!hits.length) return null;
  const perKg = o => o.price / (packGrams(def, o) / 1000);
  const rank = o => perKg(o) * (def.prefer && def.prefer.test(textOf(o)) ? 0.99 : 1);
  const o = hits.sort((a, b) => rank(a) - rank(b))[0];
  return { price: o.price, pack: packGrams(def, o), label: sizeLabel(o.qty, o.unit), product: sentence(o.name),
    desc: o.desc ? sentence(o.desc) : '', perKg: Math.round(perKg(o) * 100) / 100, url: o.url, id: o.id };
}
const SALE = {};
for (const k of Object.keys(INGREDIENTS)) { const s = bestOffer(k); if (s) SALE[k] = s; }
console.log(`On offer: ${Object.keys(SALE).join(', ') || 'nothing matched'}`);

// ---------- 3. score recipes
let seed = week.year * 100 + week.week;
const jitter = id => { let h = seed; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 1000) / 1000 * 0.08; };

function resolve(r) {
  const ing = r.ing.map(([spec, g]) => {
    const opts = spec.split('|');
    const onSale = opts.filter(k => SALE[k]).sort((a, b) => SALE[a].perKg - SALE[b].perKg);
    return [onSale[0] || opts[0], g];
  });
  let num = 0, den = 0, protein = null, proteinOnSale = false;
  for (const [k, g] of ing) {
    const def = INGREDIENTS[k], w = WEIGHT[def.group] * Math.sqrt(g);
    den += w; if (SALE[k]) num += w;
    if (def.group === 'protein' && !protein) { protein = k; proteinOnSale = !!SALE[k]; }
  }
  const score = (den ? num / den : 0) + (proteinOnSale ? 0.35 : 0) + jitter(r.id);
  return { ...r, ing, score, protein };
}

function pick(type) {
  const ranked = RECIPES.filter(r => r.type === type).map(resolve).sort((a, b) => b.score - a.score);
  const chosen = [], usedProtein = new Set(), groupCount = {};
  for (const r of ranked) {
    if (chosen.length >= PICK[type]) break;
    if (type === 'dinner' && r.protein) {
      const g = INGREDIENTS[r.protein].pg;
      if (usedProtein.has(r.protein) || (groupCount[g] || 0) >= 2) continue;
      usedProtein.add(r.protein); groupCount[g] = (groupCount[g] || 0) + 1;
    }
    chosen.push(r);
  }
  for (const r of ranked) if (chosen.length < PICK[type] && !chosen.includes(r)) chosen.push(r);
  return chosen;
}
const meals = ['dinner', 'breakfast', 'lunch'].flatMap(pick).map(r => ({
  id: r.id, type: r.type, name: r.name, dk: r.dk, base: r.base, portions: DEFAULT_PORTIONS[r.type] || r.base,
  time: r.time, tags: r.tags, ing: r.ing, steps: r.steps, ...(r.tip ? { tip: r.tip } : {}),
}));

// ---------- 4. output
const used = new Set(meals.flatMap(m => m.ing.map(([k]) => k)));
const ing = {};
for (const k of used) {
  const { re, ex, cats, subs, group, pg, stkG, ...rest } = INGREDIENTS[k];
  ing[k] = { ...rest, ...(SALE[k] ? { sale: SALE[k] } : {}) };
}
const ORDER = ['kod-fisk-fjerkrae', 'kol', 'frugt-gront', 'mejeri', 'ost-mv', 'brod-bavinchi', 'frost', 'kolonial', '*'];
const usedIds = new Set(Object.values(SALE).map(s => s.id));
const offerList = offers
  .sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'da'))
  .map(o => ({ name: sentence(o.name), desc: o.desc ? sentence(o.desc) : '', size: sizeLabel(o.qty, o.unit), price: o.price,
    unitPrice: o.unitPrice, per: o.per, cat: o.cat, url: o.url, inPlan: usedIds.has(o.id) && [...used].some(k => SALE[k]?.id === o.id) }));

const data = { ...week, source, generatedAt: new Date().toISOString(), ing, meals, offers: offerList };
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(`Week ${week.week} (${week.validFrom} → ${week.validTo}): ${meals.map(m => m.id).join(', ')}`);
console.log(`Wrote ${OUT}`);
