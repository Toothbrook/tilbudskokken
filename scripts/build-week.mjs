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
import { INGREDIENTS, RECIPES, GLUTEN } from './recipes.mjs';
import { createPlanner, glutenFree, cover } from '../planner.js';
import { scrapeApi, scrapeRema, scrapeTjek, scrapeCatalogue, parseProduct, computedWeek, productDetails } from './offers.mjs';

const args = process.argv.slice(2);
const arg = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const OUT = arg('--out') || 'data/week.json';
const PRICES_OUT = path.join(path.dirname(OUT), 'prices.json');

// --if-stale (scheduled runs): leave a plan that still covers today alone, so the week people
// have started on doesn't change under them when prices move. Sunday's run finds last week's
// plan out of date; Monday's retry only rebuilds if Sunday's failed.
if (args.includes('--if-stale')) {
  try {
    const cur = JSON.parse(await fs.readFile(OUT, 'utf8')), today = new Date().toISOString().slice(0, 10);
    if (cur.validFrom <= today && today <= cur.validTo) {
      console.log(`Week ${cur.week} (${cur.validFrom} → ${cur.validTo}) is still current. Nothing to do.`);
      process.exit(0);
    }
  } catch { /* no plan yet: build one */ }
}

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
    product: sentence(o.name), desc: o.desc ? sentence(o.desc) : '', onSale, id: o.id, url: o.url || '', ...(o.cat && o.cat !== '*' ? { cat: o.cat } : {}), ...(o.loose ? { loose: true } : {}) };
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
// Gluten-free mode: gluten-free stand-ins for bread, pasta, oats and the like (searched across the
// whole shop), and the ingredient lists of everything that could hide gluten.
const GF_CAND = {};
for (const [key, gf] of Object.entries(GLUTEN.grain)) {
  if (!gf.re) { GF_CAND[key] = []; continue; }
  const def = { ...INGREDIENTS[key], est: gf.est || INGREDIENTS[key].est };
  GF_CAND[key] = [...offers.filter(o => gf.re.test(textOf(o))).map(o => toOption(def, o, true)),
    ...catalogue.filter(o => gf.re.test(textOf(o))).map(o => toOption(def, o, false))].filter(Boolean);
}
const GF_KEYS = new Set([...Object.keys(GLUTEN.grain), ...GLUTEN.check]);
const glutenCheck = { checked: 0, free: 0 };
if (!arg('--offers') || arg('--details')) {
  try {
    const want = new Set();
    for (const key of GLUTEN.check) if (USED.has(key)) for (const o of CANDIDATES[key]) if (/^\d+$/.test(o.id || '') && !(o.id in DETAILS)) want.add(o.id);
    for (const key in GF_CAND) for (const o of GF_CAND[key]) if (/^\d+$/.test(o.id || '') && !(o.id in DETAILS)) want.add(o.id);
    if (want.size) Object.assign(DETAILS, (await productDetails([...want])).details);
  } catch (e) { console.warn(`Gluten check failed: ${e.message}`); }
}
// A product counts as gluten-free when it is labelled so or its ingredient list shows no gluten
// and no traces. Unknown counts as not gluten-free.
const isGF = o => /GLUTENFRI/.test(`${o.product} ${o.desc}`.toUpperCase()) || ['free', 'clean'].includes(DETAILS[o.id]?.gluten);

additiveCheck.checked = Object.values(DETAILS).filter(Boolean).length;
additiveCheck.flagged = Object.entries(DETAILS).filter(([, d]) => d?.additives?.length).length;

const OPTIONS = {}, GF_OPTIONS = {}, stats = { sale: 0, shelf: 0, est: 0, unavoidable: [] };
for (const key of USED) {
  const def = INGREDIENTS[key], all = CANDIDATES[key], clean = all.filter(o => !flagged(o));
  let opts = (clean.length ? clean : all).map(o => DETAILS[o.id]?.additives?.length ? { ...o, additives: DETAILS[o.id].additives } : o);
  if (all.length && !clean.length) stats.unavoidable.push(key);
  if (!all.some(o => !o.onSale)) opts.push({ price: def.est[0], pack: def.est[1], label: def.est[2], product: def.n, desc: '', onSale: false, est: true });
  OPTIONS[key] = frontier(opts);
  if (GF_KEYS.has(key) && !GLUTEN.grain[key]?.as) {
    // The packs gluten-free mode may buy: checked products, or a gluten-free stand-in.
    const gfAll = (GLUTEN.grain[key] ? GF_CAND[key] : all).filter(isGF), gfClean = gfAll.filter(o => !flagged(o));
    const gfOpts = (gfClean.length ? gfClean : gfAll).map(o => DETAILS[o.id]?.additives?.length ? { ...o, additives: DETAILS[o.id].additives } : o);
    const gf = GLUTEN.grain[key];
    if (gf?.est && !gfOpts.some(o => !o.onSale)) gfOpts.push({ price: gf.est[0], pack: gf.est[1], label: gf.est[2], product: gf.n, desc: '', onSale: false, est: true });
    GF_OPTIONS[key] = frontier(gfOpts);
    glutenCheck.checked++; if (GF_OPTIONS[key].length) glutenCheck.free++;
  }
  if (OPTIONS[key].some(o => o.onSale)) stats.sale++; else if (OPTIONS[key].some(o => !o.est)) stats.shelf++; else stats.est++;
}
// What each offer pack costs at normal price: the same product's shelf price when REMA lists it,
// otherwise the cheapest normal-price pack of that ingredient per gram. The planner uses the
// difference to prefer meals built on this week's discounts.
const shelfById = new Map(catalogue.map(o => [String(o.id), o]));
for (const key of Object.keys(OPTIONS)) {
  const def = INGREDIENTS[key];
  const ref = OPTIONS[key].concat(CANDIDATES[key]).filter(o => !o.onSale).sort((a, b) => a.price / a.pack - b.price / b.pack)[0];
  for (const o of [...OPTIONS[key], ...(GF_OPTIONS[key] || [])]) {
    if (!o.onSale) continue;
    const same = shelfById.get(String(o.id));
    const normal = same && !same.loose ? same.price * (o.pack / packGrams(def, same)) : ref ? ref.price / ref.pack * o.pack : def.est[0] / def.est[1] * o.pack;
    if (normal > o.price * 1.02) o.normal = Math.round(normal * 100) / 100;
  }
}
// ---------- Netto: its weekly offers, for the site's "Netto too" switch. Only offers (Netto's
// normal prices aren't public), and only for plain foods: Tjek shows no ingredient lists, so
// processed things that could hide additives or gluten (sausages, cold cuts, sauces, spices,
// bread) stay at REMA, where they're checked.
const NETTO_SKIP = new Set([...GLUTEN.check, 'medister', 'bacon', 'polser', 'leverpostej', 'skinke', 'rogetfisk', 'makreltomat',
  'brunsauce', 'bearnaise', 'fond', 'tacokrydderi', 'rugbrod', 'toast', 'boller', 'burgerboller', 'wraps', 'pizzadej', 'taertedej']);
let netto = [], nettoSource = null;
if (arg('--netto')) ({ offers: netto, source: nettoSource } = JSON.parse(await fs.readFile(arg('--netto'), 'utf8')));
else if (!arg('--offers')) {
  try { ({ offers: netto, source: nettoSource } = await scrapeTjek(console.log, /^netto$/i, 'Netto')); }
  catch (e) { console.warn(`Netto offers failed: ${e.message}`); }
}
if (arg('--save-netto') && nettoSource) await fs.writeFile(arg('--save-netto'), JSON.stringify({ source: nettoSource, offers: netto }, null, 1));
// Offers that run at some point in this offer week.
netto = netto.filter(o => (!o.from || o.from.slice(0, 10) <= week.validTo) && (!o.till || o.till.slice(0, 10) >= week.validFrom));
// Tjek's texts are long and often list several products ("A, B eller C"), so for Netto the
// ingredient has to be in the offer's heading, nothing breaded, cold-cut, sweet or drinkable
// counts, and per-ingredient nex/nmust tighten it further (frozen veg must say frozen).
const NETTO_EX = /PÅLÆG|SPEGEPØLSE|INDBAG|PANER|SNACK|SLIK|MALACO|HARIBO|VINGUMMI|LAKRIDS|\bVIN\b|RØDVIN|HVIDVIN|ROSÉ|\bØL\b|ACTIMEL|DANONINO|DRIK|JUICE|SMOOTHIE|SAFT|BRØDBLANDING|GLUTEN ?MEL|KAGE|KIKS|CHIPS|GRANATÆBLE|BACON|FÆRDIGRET|MARINERET|SALATMESTEREN/;
const nettoMatches = (def, o) => {
  const t = textOf(o);
  return def.re.test(o.name.toUpperCase()) && !NETTO_EX.test(t) && !(def.ex && def.ex.test(t)) && !(def.nex && def.nex.test(t))
    && !(def.must && !def.must.test(t)) && !(def.nmust && !def.nmust.test(t));
};
const NETTO = {};
for (const key of USED) {
  // A matcher that leans on REMA's departments (re: /./) needs its own pattern for Netto (nre).
  const def = INGREDIENTS[key].nre ? { ...INGREDIENTS[key], re: INGREDIENTS[key].nre } : INGREDIENTS[key];
  if (NETTO_SKIP.has(key) || def.re.test('ZZZ QQQ')) continue;
  const opts = netto.filter(o => nettoMatches(def, o)).map(o => {
    const opt = toOption(def, o, true);
    return opt && { ...opt, store: 'netto', till: o.till ? o.till.slice(0, 10) : '', ...(o.normal ? { normal: Math.round(o.normal / o.price * opt.price * 100) / 100 } : {}) };
  }).filter(Boolean);
  if (opts.length) NETTO[key] = frontier(opts);
}
console.log(`Netto: ${netto.length} offers this week, ${Object.keys(NETTO).length} ingredients with a Netto offer`);

console.log(`Priced ${Object.keys(OPTIONS).length} ingredients: ${stats.sale} on offer, ${stats.shelf} at shelf price, ${stats.est} estimated`);
console.log(`Gluten: ${glutenCheck.free} of ${glutenCheck.checked} ingredients that can contain gluten have a gluten-free choice`);
console.log(`Additives: ${additiveCheck.checked} products checked, ${additiveCheck.flagged} flagged and skipped where possible${stats.unavoidable.length ? `; no clean choice for ${stats.unavoidable.join(', ')}` : ''}`);

// ---------- 3. plan (the same planner the website runs live)
const ing = {};
for (const k of USED) {
  const { re, ex, must, cats, subs, stkG, est, ...rest } = INGREDIENTS[k];
  ing[k] = { ...rest, options: OPTIONS[k], ...(NETTO[k] ? { netto: NETTO[k] } : {}) };
  if (GLUTEN.grain[k]?.as) Object.assign(ing[k], { gluten: 'grain', gfAs: GLUTEN.grain[k].as });
  else if (GLUTEN.grain[k]) Object.assign(ing[k], { gluten: 'grain', gfN: GLUTEN.grain[k].n, gfOptions: GF_OPTIONS[k] });
  else if (GLUTEN.check.includes(k)) Object.assign(ing[k], { gluten: 'check', gfOptions: GF_OPTIONS[k] });
}
const recipes = RECIPES.map(r => ({ ...r, kind: r.kind || 'healthy' }));
const seed = week.year * 100 + week.week;
const planner = createPlanner({ recipes, ing, seed });
const FRI_SAT = [0, 0, 0, 0, 0, 1, 1].map(Boolean);   // day 0 is Sunday, the first day of the offer week
const dealsUsed = p => Object.entries(p.need).map(([k, g]) => cover(ing[k], g)).filter(c => c.o?.onSale);
for (const [label, people, treat, cheap] of [['1 person', 1], ['2 people', 2], ['4 people', 4], ['2 people, Fri+Sat treat', 2, FRI_SAT], ['2 people, not cheapest', 2, undefined, false]]) {
  const p = planner.plan(people, treat, 2000, { cheap });
  if (!p) { console.error(`No plan could be made for ${label}`); process.exit(1); }
  console.log(`${label.padEnd(24)} ${p.total.toFixed(2).padStart(8)} kr · ${dealsUsed(p).length} offers, saves ${p.saved.toFixed(0)} kr · q${p.quality.toFixed(2)} · `
    + p.days.map(d => `${d.treat ? '*' : ''}${d.d}${d.left ? '(rest)' : ''}`).join(' '));
}

{ // gluten-free mode, as the site runs it
  const gf = glutenFree({ recipes, ing }), gp = createPlanner({ recipes: gf.recipes, ing: gf.ing, seed }).plan(2);
  console.log(`Gluten-free: ${gf.recipes.length} of ${recipes.length} recipes possible · 2 people `
    + (gp ? `${gp.total.toFixed(2)} kr · ${gp.days.map(d => d.d).join(' ')}` : 'NO PLAN (the switch will be hidden)'));
}

// ---------- 4. output
const ORDER = ['kod-fisk-fjerkrae', 'kol', 'frugt-gront', 'mejeri', 'ost-mv', 'brod-bavinchi', 'frost', 'kolonial', '*'];
const offerList = [...offers]
  .sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'da'))
  .map(o => ({ id: o.id, name: sentence(o.name), desc: o.desc ? sentence(o.desc) : '', size: sizeLabel(o.qty, o.unit), price: o.price,
    unitPrice: o.unitPrice, per: o.per, cat: o.cat, url: o.url }));

const data = { ...week, source, generatedAt: new Date().toISOString(), shelfPrices: catalogue.length ? 'live' : 'estimated',
  additives: { checked: additiveCheck.checked, flagged: additiveCheck.flagged }, netto: nettoSource ? { source: nettoSource, offers: netto.length } : null, seed, defaultPeople: 2, recipes, ing, offers: offerList };
await fs.mkdir(path.dirname(OUT), { recursive: true });
// Keep the outgoing week as prev-week.json: people who shop mid-week are still eating it for a few
// days after the new offers arrive on Sunday.
try {
  const old = JSON.parse(await fs.readFile(OUT, 'utf8'));
  if (old.week !== data.week || old.year !== data.year) await fs.writeFile(path.join(path.dirname(OUT), 'prev-week.json'), JSON.stringify(old) + '\n');
} catch { /* first week */ }
await fs.writeFile(OUT, JSON.stringify(data) + '\n');
await fs.writeFile(PRICES_OUT, JSON.stringify({ week: week.week, catalogueProducts: catalogue.length, additiveCheck,
  flaggedProducts: Object.fromEntries(Object.entries(DETAILS).filter(([, d]) => d?.additives?.length).map(([id, d]) => [id, d.additives])),
  gluten: Object.fromEntries([...GF_KEYS].filter(k => USED.has(k)).map(k => [k, (GLUTEN.grain[k] ? GF_CAND[k] : CANDIDATES[k]).map(o =>
    `${DETAILS[o.id]?.gluten || 'unknown'} · ${o.product} ${o.label} ${o.price} kr${DETAILS[o.id]?.decl ? ' · ' + DETAILS[o.id].decl.slice(0, 160) : ''}`)])),
  netto: Object.fromEntries(Object.entries(NETTO).map(([k, o]) => [k, o.map(x => `${x.product} ${x.desc} ${x.label} ${x.price} kr${x.normal ? ` (før ${x.normal})` : ''} til ${x.till}`)])),
  ingredients: Object.fromEntries(Object.entries(OPTIONS).map(([k, o]) => [k, o.map(x => `${x.onSale ? 'TILBUD ' : x.est ? 'EST ' : ''}${x.product} ${x.label} ${x.price} kr${x.additives ? ' ⚠ ' + x.additives.join(',') : ''}`)])) }, null, 1) + '\n');
console.log(`Week ${week.week} (${week.validFrom} → ${week.validTo}), shelf prices ${data.shelfPrices}. Wrote ${OUT}`);
