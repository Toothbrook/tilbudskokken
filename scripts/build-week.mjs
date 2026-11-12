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
import { scrapeApi, scrapeRema, scrapeTjek, scrapeCatalogue, parseProduct, computedWeek, productDetails } from './offers.mjs';

const args = process.argv.slice(2);
const arg = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const OUT = arg('--out') || 'data/week.json';
const PRICES_OUT = path.join(path.dirname(OUT), 'prices.json');
// A week is 7 breakfasts, lunches and dinners. Each slot is one recipe covering that many days:
// dinners cooked for 2 nights are eaten as leftovers the next evening.
const SLOTS = { dinner: [2, 2, 1, 1, 1], lunch: [3, 2, 2], breakfast: [3, 2, 2] };
const PEOPLE = [1, 2, 3, 4, 5, 6, 7, 8];
// Per-portion sanity range at recipe size (before scaling to the calorie target).
const KCAL = { dinner: [300, 1100], lunch: [200, 850], breakfast: [200, 700] };
const TARGET_KCAL = 2000;   // plans are sized and priced for this per person per day; the site rescales
let SIZE = 1;               // portion scale used while pricing
const CARBS = ['kartofler', 'ris', 'pasta', 'wraps', 'toast', 'boller', 'rugbrod'];

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

// ---------- 3. cost model
function cover(key, g) {
  if (g <= 0) return { cost: 0 };
  const def = INGREDIENTS[key];
  let best = null;
  for (const o of OPTIONS[key]) {
    const n = o.loose ? 1 : Math.max(1, Math.ceil(g / o.pack - 0.03));
    const cost = o.loose ? o.price * Math.max(g, def.each || 200) / o.pack : n * o.price;
    if (!best || cost < best.cost - 1e-9) best = { cost, o, n };
  }
  return best;
}
const shopCost = need => Object.entries(need).reduce((s, [k, g]) => s + cover(k, g).cost, 0);
const nutrition = (ing, portions) => {
  let k = 0, p = 0; for (const [key, g] of ing) { k += INGREDIENTS[key].kcal * g / 100; p += INGREDIENTS[key].p * g / 100; }
  return { kcal: k / portions, p: p / portions };
};

// Resolve 'a|b' lines to whichever adds least to the shop, then price the meal against what's already bought.
function evaluate(r, need, portions) {
  const f = portions / r.base * SIZE;
  const trial = { ...need }, ing = [];
  let added = 0;
  for (const [spec, g] of r.ing) {
    let best = null;
    for (const k of spec.split('|')) {
      const before = cover(k, trial[k] || 0).cost, after = cover(k, (trial[k] || 0) + g * f).cost;
      const d = after - before;
      if (!best || d < best.d - 1e-9) best = { k, d };
    }
    trial[best.k] = (trial[best.k] || 0) + g * f; added += best.d; ing.push([best.k, g]);
  }
  const protein = ing.map(([k]) => k).find(k => INGREDIENTS[k].group === 'protein');
  const carb = ing.map(([k]) => k).find(k => CARBS.includes(k));
  return { r, ing, portions, added, perPortion: added / portions, trial, protein, carb, ...nutrition(ing, r.base) };
}
const seed = week.year * 100 + week.week;
const jitter = id => { let h = seed; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 1 + (h % 1000) / 1000 * 0.06; };

function greedy(people, firstDinner) {
  let need = {};
  const chosen = [];
  for (const type of ['dinner', 'lunch', 'breakfast']) {
    const usedProtein = new Set(), family = {}, carbs = {};
    SLOTS[type].forEach((days, i) => {
      if (chosen.failed) return;
      const portions = days * people;
      const pool = RECIPES.filter(r => r.type === type && !chosen.some(c => c.r.id === r.id)
        && !(days > 1 && r.leftovers === false)).map(r => evaluate(r, need, portions));
      const ok = c => {
        const [lo, hi] = KCAL[type];
        if (c.kcal < lo || c.kcal > hi) return false;
        if (type === 'dinner') {
          if (c.protein && (usedProtein.has(c.protein) || (family[INGREDIENTS[c.protein].pg] || 0) >= 2)) return false;
          if (c.carb && (carbs[c.carb] || 0) >= 2) return false;
        } else if (c.protein && usedProtein.has(c.protein) && pool.some(o => o.protein !== c.protein)) return false;
        return true;
      };
      const allowed = pool.filter(ok).length ? pool.filter(ok) : pool;
      const best = type === 'dinner' && i === 0 && firstDinner
        ? allowed.find(c => c.r.id === firstDinner)
        : allowed.sort((a, b) => a.perPortion * jitter(a.r.id) - b.perPortion * jitter(b.r.id))[0];
      if (!best) { chosen.failed = true; return; }
      chosen.push({ ...best, days }); need = best.trial;
      if (best.protein) { usedProtein.add(best.protein); const g = INGREDIENTS[best.protein].pg; family[g] = (family[g] || 0) + 1; }
      if (best.carb) carbs[best.carb] = (carbs[best.carb] || 0) + 1;
    });
  }
  if (chosen.failed) return null;
  const portions = chosen.reduce((s, c) => s + c.portions, 0);
  return { chosen, need, total: shopCost(need), portions };
}

// Lay the week out day by day, starting on the first day of the offer week.
function schedule(chosen) {
  const of = t => chosen.filter(c => c.r.type === t);
  const dinners = of('dinner').flatMap(c => Array.from({ length: c.days }, (_, n) => ({ id: c.r.id, left: n > 0 })));
  // Round-robin so the same breakfast/lunch isn't eaten three days running.
  const rotate = t => {
    const list = of(t), left = Object.fromEntries(list.map(c => [c.r.id, c.days])), out = [];
    for (let k = 0; out.length < 7 && k < 50; k++) { const id = list[k % list.length].r.id; if (left[id] > 0) { out.push(id); left[id]--; } }
    return out;
  };
  const b = rotate('breakfast'), l = rotate('lunch');
  const start = Date.parse(week.validFrom + 'T12:00:00Z');
  return Array.from({ length: 7 }, (_, d) => ({ date: new Date(start + d * 864e5).toISOString().slice(0, 10),
    b: b[d], l: l[d], d: dinners[d].id, left: dinners[d].left }));
}

// Pack sizes round differently for 1 person and for 6, so plan each household size on its own.
const plans = {}, allNeed = {}, recipeIds = new Set();
const dayKcal = chosen => chosen.reduce((s, c) => s + c.kcal * c.days, 0) / 7;
for (const people of PEOPLE) {
  // Price at the size people will actually eat: plan, measure the day's calories, rescale, plan again.
  let best;
  SIZE = 1;
  for (let pass = 0; pass < 3; pass++) {
    const tries = RECIPES.filter(r => r.type === 'dinner' && r.leftovers !== false).map(r => greedy(people, r.id)).filter(Boolean);
    best = tries.sort((a, b) => a.total / a.portions - b.total / b.portions)[0];
    const next = Math.min(2.5, Math.max(0.6, TARGET_KCAL / dayKcal(best.chosen)));
    if (Math.abs(next - SIZE) < 0.03) break;
    SIZE = next;
  }
  const onSale = Object.entries(best.need).reduce((s, [k, g]) => { const c = cover(k, g); return s + (c.o?.onSale ? c.cost : 0); }, 0);
  plans[people] = { people, total: +best.total.toFixed(2), portions: best.portions, perPortion: +(best.total / best.portions).toFixed(2),
    onSale: +onSale.toFixed(2), size: +SIZE.toFixed(3), kcal: TARGET_KCAL, cook: Object.fromEntries(best.chosen.map(c => [c.r.id, c.portions])),
    pick: Object.fromEntries(best.chosen.map(c => [c.r.id, c.ing.map(([k]) => k)])), days: schedule(best.chosen) };
  for (const k of Object.keys(best.need)) allNeed[k] = true;
  best.chosen.forEach(c => recipeIds.add(c.r.id));
  console.log(`${people} ${people > 1 ? 'people' : 'person '}: ×${SIZE.toFixed(2)} ${best.total.toFixed(2)} kr for ${best.portions} portions (${(best.total / best.portions).toFixed(2)} kr/portion) · `
    + best.chosen.map(c => `${c.r.id}×${c.days}`).join(' '));
}

// ---------- 4. output
// Each plan resolves 'a|b' lines its own way, so meals carry the raw lines and each plan says what it picked.
const meals = RECIPES.filter(r => recipeIds.has(r.id)).map(r => ({ id: r.id, type: r.type, name: r.name, dk: r.dk, base: r.base,
  time: r.time, tags: r.tags, steps: r.steps, ...(r.tip ? { tip: r.tip } : {}), ...(r.leftovers === false ? { leftovers: false } : {}) }));
const ing = {};
for (const k of Object.keys(allNeed)) {
  const { re, ex, cats, subs, group, pg, stkG, est, ...rest } = INGREDIENTS[k];
  ing[k] = { ...rest, group, options: OPTIONS[k] };
}
const grams = Object.fromEntries(RECIPES.filter(r => recipeIds.has(r.id)).map(r => [r.id, r.ing.map(([, g]) => g)]));

const ORDER = ['kod-fisk-fjerkrae', 'kol', 'frugt-gront', 'mejeri', 'ost-mv', 'brod-bavinchi', 'frost', 'kolonial', '*'];
const offerList = [...offers]
  .sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'da'))
  .map(o => ({ id: o.id, name: sentence(o.name), desc: o.desc ? sentence(o.desc) : '', size: sizeLabel(o.qty, o.unit), price: o.price,
    unitPrice: o.unitPrice, per: o.per, cat: o.cat, url: o.url }));

const data = { ...week, source, generatedAt: new Date().toISOString(), shelfPrices: catalogue.length ? 'live' : 'estimated',
  additives: { checked: additiveCheck.checked, flagged: additiveCheck.flagged },
  defaultPeople: 2, plans, ing, meals, grams, offers: offerList };
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(data) + '\n');
await fs.writeFile(PRICES_OUT, JSON.stringify({ week: week.week, catalogueProducts: catalogue.length, additiveCheck,
  flaggedProducts: Object.fromEntries(Object.entries(DETAILS).filter(([, d]) => d?.additives?.length).map(([id, d]) => [id, d.additives])),
  ingredients: Object.fromEntries(Object.entries(OPTIONS).map(([k, o]) => [k, o.map(x => `${x.onSale ? 'TILBUD ' : x.est ? 'EST ' : ''}${x.product} ${x.label} ${x.price} kr${x.additives ? ' ⚠ ' + x.additives.join(',') : ''}`)])) }, null, 1) + '\n');
console.log(`Week ${week.week} (${week.validFrom} → ${week.validTo}), shelf prices ${data.shelfPrices}. Wrote ${OUT}`);
