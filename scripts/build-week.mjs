#!/usr/bin/env node
// Builds data/week.json: this week's REMA 1000 offers + normal shelf prices -> the cheapest good week.
//
// Nothing is assumed to be in the cupboard. Every ingredient is priced as the cheapest pack (or
// packs) that covers what the week needs, on offer or not. Meals are picked one at a time by how
// much they add to the total shop, so packs bought for one meal are used up by the next.
//
//   node scripts/build-week.mjs                        # live: REMA API (fallbacks: shop pages, Tjek)
//   node scripts/build-week.mjs --offers file.json     # offline: saved offers, fallback shelf prices
//   node scripts/build-week.mjs --catalogue file.json  # offline: also use a saved catalogue
import fs from 'node:fs/promises';
import path from 'node:path';
import { INGREDIENTS, RECIPES } from './recipes.mjs';
import { createPlanner } from '../planner.js';
import { scrapeApi, scrapeRema, scrapeTjek, scrapeCatalogue, parseProduct, computedWeek, productDetails } from './offers.mjs';

const args = process.argv.slice(2);
const arg = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const OUT = arg('--out') || 'data/week.json';
const PRICES_OUT = path.join(path.dirname(OUT), 'prices.json');

// ---------- 1. offers
let offers, week, source, catalogue = [];
if (arg('--offers')) {
  const fx = JSON.parse(await fs.readFile(arg('--offers'), 'utf8'));
  offers = fx.products ? fx.products.map(p => parseProduct(p.href, p.text)).filter(Boolean) : fx.offers;
  week = fx.week || computedWeek(); source = fx.source || 'shop.rema1000.dk';
  if (arg('--catalogue')) catalogue = JSON.parse(await fs.readFile(arg('--catalogue'), 'utf8'));
} else {
  offers = [];
  try { ({ offers, week, source } = await scrapeApi()); console.log(`REMA API: ${offers.length} food offers`); }
  catch (e) { console.warn(`REMA API failed: ${e.message}`); offers = []; }
  if (offers.length < 15) {
    try { const r = await scrapeRema(); console.log(`REMA shop pages: ${r.offers.length} food offers`); if (r.offers.length > offers.length) ({ offers, week, source } = r); }
    catch (e) { console.warn(`REMA shop pages failed: ${e.message}`); }
  }
  if (offers.length < 15) {
    try { const t = await scrapeTjek(); if (t.offers.length > offers.length) ({ offers, week, source } = t); }
    catch (e) { console.warn(`Tjek fallback failed: ${e.message}`); }
  }
  try { catalogue = await scrapeCatalogue(); }
  catch (e) { console.warn(`Catalogue failed, using fallback shelf prices: ${e.message}`); catalogue = []; }
}
if (!offers || offers.length < 15) { console.error(`Only ${offers?.length || 0} offers found. Keeping the previous plan.`); process.exit(1); }
if (arg('--save-offers')) await fs.writeFile(arg('--save-offers'), JSON.stringify({ week, source, offers }, null, 1));
if (arg('--save-catalogue')) await fs.writeFile(arg('--save-catalogue'), JSON.stringify(catalogue));

// ---------- 2. price every ingredient: offers + shelf prices -> the packs worth considering
const textOf = o => `${o.name} ${o.desc}`.toUpperCase();
const sentence = s => { const l = String(s || '').toLowerCase(); return l.charAt(0).toUpperCase() + l.slice(1); };
const sizeLabel = (qty, unit) => unit === 'stk' ? `${qty} stk` : qty >= 1000
  ? `${String(+(qty / 1000).toFixed(2)).replace('.', ',')} ${unit === 'g' ? 'kg' : 'l'}` : `${qty} ${unit}`;
const packGrams = (def, o) => o.loose ? 1000 : o.unit === 'stk' ? o.qty * (def.stkG ?? def.each ?? 500) : o.qty;

function matches(def, o) {
  if (!def.re) return false;
  if (def.cats && o.cat !== '*' && !def.cats.includes(o.cat)) return false;
  if (def.subs && o.cat !== '*' && !def.subs.includes(o.sub)) return false;
  const t = textOf(o);
  return def.re.test(t) && !(def.ex && def.ex.test(t)) && !(def.must && !def.must.test(t));
}
function toOption(def, o, onSale) {
  const pack = packGrams(def, o);
  if (!pack || !o.price) return null;
  const estPerKg = def.est[0] / def.est[1] * 1000, perKg = o.price / pack * 1000;
  if (perKg > estPerKg * 4 || perKg < estPerKg / 4) return null;   // almost certainly a wrong match
  return { price: o.price, pack, label: o.loose ? `${String(o.price).replace('.', ',')} kr/kg` : sizeLabel(o.qty, o.unit),
    product: sentence(o.name), desc: o.desc ? sentence(o.desc) : '', onSale, id: o.id, url: o.url || '', ...(o.loose ? { loose: true } : {}) };
}
// Keep only packs nothing beats: drop A if some B is at least as big and no dearer.
function frontier(opts) {
  const out = opts.filter(a => !opts.some(b => b !== a && b.pack >= a.pack && b.price <= a.price
    && (b.pack > a.pack || b.price < a.price || (b.onSale && !a.onSale) || opts.indexOf(b) < opts.indexOf(a))));
  return out.sort((a, b) => a.pack - b.pack).slice(0, 6);
}
// Only ingredients some recipe uses.
const USED = new Set(RECIPES.flatMap(r => r.ing.flatMap(([spec]) => spec.split('|'))));
const CANDIDATES = {};
for (const key of USED) {
  const def = INGREDIENTS[key];
  CANDIDATES[key] = [
    ...offers.filter(o => matches(def, o)).map(o => toOption(def, o, true)),
    ...catalogue.filter(o => matches(def, o)).map(o => toOption(def, o, false)),
  ].filter(Boolean);
}

// Skip products with additives worth avoiding whenever the same ingredient has a clean product.
// Details are fetched only for packs that would otherwise be picked, a few rounds deep.
const DETAILS = {};
let additiveCheck = { checked: 0, failed: 0, probe: null };
const flagged = o => !!(o.id && DETAILS[o.id]?.additives?.length);
if (!arg('--offers') || arg('--details')) {
  try {
    for (let round = 0; round < 6; round++) {
      const want = new Set();
      for (const key of USED) {
        const clean = CANDIDATES[key].filter(o => !flagged(o));
        for (const o of frontier(clean.length ? clean : CANDIDATES[key])) if (/^\d+$/.test(o.id || '') && !(o.id in DETAILS)) want.add(o.id);
      }
      if (!want.size) break;
      const r = await productDetails([...want]);
      Object.assign(DETAILS, r.details);
      additiveCheck.failed += r.failed; additiveCheck.probe ||= r.probe;
      if (r.failed === want.size) { console.warn('  product details unavailable, additives not checked'); break; }
    }
  } catch (e) { console.warn(`Additive check failed: ${e.message}`); }
}
additiveCheck.checked = Object.values(DETAILS).filter(Boolean).length;
additiveCheck.flagged = Object.entries(DETAILS).filter(([, d]) => d?.additives?.length).length;

const OPTIONS = {}, stats = { sale: 0, shelf: 0, est: 0, unavoidable: [] };
for (const key of USED) {
  const def = INGREDIENTS[key], all = CANDIDATES[key], clean = all.filter(o => !flagged(o));
  let opts = (clean.length ? clean : all).map(o => DETAILS[o.id]?.additives?.length ? { ...o, additives: DETAILS[o.id].additives } : o);
  if (all.length && !clean.length) stats.unavoidable.push(key);
  if (!all.some(o => !o.onSale)) opts.push({ price: def.est[0], pack: def.est[1], label: def.est[2], product: def.n, desc: '', onSale: false, est: true });
  OPTIONS[key] = frontier(opts);
  if (OPTIONS[key].some(o => o.onSale)) stats.sale++; else if (OPTIONS[key].some(o => !o.est)) stats.shelf++; else stats.est++;
}
console.log(`Priced ${Object.keys(OPTIONS).length} ingredients: ${stats.sale} on offer, ${stats.shelf} at shelf price, ${stats.est} estimated`);
console.log(`Additives: ${additiveCheck.checked} products checked, ${additiveCheck.flagged} flagged and skipped where possible${stats.unavoidable.length ? `; no clean choice for ${stats.unavoidable.join(', ')}` : ''}`);

// ---------- 3. plan (the same planner the website runs live)
const ing = {};
for (const k of USED) {
  const { re, ex, must, cats, subs, stkG, est, ...rest } = INGREDIENTS[k];
  ing[k] = { ...rest, options: OPTIONS[k] };
}
const recipes = RECIPES.map(r => ({ ...r, kind: r.kind || 'healthy' }));
const seed = week.year * 100 + week.week;
const planner = createPlanner({ recipes, ing, seed });
const FRI_SAT = [0, 0, 0, 0, 0, 1, 1].map(Boolean);   // day 0 is Sunday, the first day of the offer week
for (const [label, people, treat, cheap] of [['1 person', 1], ['2 people', 2], ['4 people', 4], ['2 people, Fri+Sat treat', 2, FRI_SAT], ['2 people, not cheapest', 2, undefined, false]]) {
  const p = planner.plan(people, treat, 2000, { cheap });
  if (!p) { console.error(`No plan could be made for ${label}`); process.exit(1); }
  console.log(`${label.padEnd(24)} ${p.total.toFixed(2).padStart(8)} kr · ${p.kcal} kcal/day · q${p.quality.toFixed(2)} · `
    + p.days.map(d => `${d.treat ? '*' : ''}${d.d}${d.left ? '(rest)' : ''}`).join(' '));
}

// ---------- 4. output
const ORDER = ['kod-fisk-fjerkrae', 'kol', 'frugt-gront', 'mejeri', 'ost-mv', 'brod-bavinchi', 'frost', 'kolonial', '*'];
const offerList = [...offers]
  .sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'da'))
  .map(o => ({ id: o.id, name: sentence(o.name), desc: o.desc ? sentence(o.desc) : '', size: sizeLabel(o.qty, o.unit), price: o.price,
    unitPrice: o.unitPrice, per: o.per, cat: o.cat, url: o.url }));

const data = { ...week, source, generatedAt: new Date().toISOString(), shelfPrices: catalogue.length ? 'live' : 'estimated',
  additives: { checked: additiveCheck.checked, flagged: additiveCheck.flagged }, seed, defaultPeople: 2, recipes, ing, offers: offerList };
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(data) + '\n');
await fs.writeFile(PRICES_OUT, JSON.stringify({ week: week.week, catalogueProducts: catalogue.length, additiveCheck,
  flaggedProducts: Object.fromEntries(Object.entries(DETAILS).filter(([, d]) => d?.additives?.length).map(([id, d]) => [id, d.additives])),
  ingredients: Object.fromEntries(Object.entries(OPTIONS).map(([k, o]) => [k, o.map(x => `${x.onSale ? 'TILBUD ' : x.est ? 'EST ' : ''}${x.product} ${x.label} ${x.price} kr${x.additives ? ' ⚠ ' + x.additives.join(',') : ''}`)])) }, null, 1) + '\n');
console.log(`Week ${week.week} (${week.validFrom} → ${week.validTo}), shelf prices ${data.shelfPrices}. Wrote ${OUT}`);
