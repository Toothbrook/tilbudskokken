// Tilbudskøkken week planner. Shared by the weekly build (Node) and the website (browser).
//
// Given every recipe and every ingredient's purchasable packs, it plans 7 days of breakfast,
// lunch and dinner for a household, picking meals one at a time by how little they add to the
// whole week's shop (whole packs, nothing assumed in the cupboard), so packs bought for one meal
// are used up by the next. Each day is either a healthy day or a treat day, which decides which
// recipes it may use. Portions are sized so a day averages the calorie target.

const KCAL = { dinner: [300, 1100], lunch: [200, 850], breakfast: [200, 700] };   // per portion at recipe size
const CARBS = ['kartofler', 'ris', 'pasta', 'bulgur', 'nudler', 'sodkartoffel', 'lasagne', 'pizzadej', 'taertedej', 'wraps', 'toast', 'boller', 'burgerboller', 'rugbrod'];
const TYPES = ['dinner', 'lunch', 'breakfast'];
const MAX_PAIRS = 2;            // dinners cooked once and eaten two nights running
const ROTATE = { healthy: 3, treat: 2 };   // distinct breakfasts/lunches per kind of day
const OPENERS = 12;             // first dinners re-tried while the portion size settles

// Cheapest way to buy g grams: n packs of one option (loose produce by weight).
export function cover(def, g) {
  if (g <= 0) return { cost: 0, o: null, n: 0 };
  let best = null;
  for (const o of def.options) {
    const n = o.loose ? 1 : Math.max(1, Math.ceil(g / o.pack - 0.03));
    const cost = o.loose ? o.price * Math.max(g, def.each || 200) / o.pack : n * o.price;
    if (!best || cost < best.cost - 1e-9) best = { cost, o, n };
  }
  return best;
}

export function createPlanner({ recipes, ing, seed = 0 }) {
  // What's already in the cupboard (opts.stock, grams per ingredient) is used first and costs nothing.
  let stock = {};
  const coverK = (k, g) => cover(ing[k], g - (stock[k] || 0));
  const shopCost = need => Object.entries(need).reduce((s, [k, g]) => s + coverK(k, g).cost, 0);
  const jitter = id => { let h = seed >>> 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 1 + (h % 1000) / 1000 * 0.06; };
  const kindOf = r => r.kind || 'healthy';

  // Resolve 'a|b' lines to whichever adds least, then price the meal against what's already bought.
  const alts = new Map(recipes.map(r => [r.id, r.ing.map(([spec, g]) => [spec.split('|').filter(k => ing[k]), g])]));
  function evaluate(r, need, portions, size) {
    const f = portions / r.base * size, add = {}, lines = [];
    let added = 0, kcal = 0, veg = 0, prot = 0, saved = 0;
    for (const [keys, g] of alts.get(r.id)) {
      let best = null;
      for (const k of keys) {
        const have = (need[k] || 0) + (add[k] || 0), d = coverK(k, have + g * f).cost - coverK(k, have).cost;
        if (!best || d < best.d - 1e-9) best = { k, d };
      }
      if (!best) return null;
      const k = best.k;
      add[k] = (add[k] || 0) + g * f; added += best.d; lines.push(k);
      const o = coverK(k, (need[k] || 0) + add[k]).o;
      if (o?.onSale && o.normal) saved += g * f * (o.normal - o.price) / o.pack;
      kcal += ing[k].kcal * g / 100; prot += ing[k].p * g / 100;
      if (ing[k].group === 'produce') veg += g;
    }
    const protein = lines.find(k => ing[k].group === 'protein');
    // Quality per 600 kcal (so small and big meals compare fairly): vegetables, protein, fish.
    const per600 = 600 / Math.max(kcal, 1);
    const quality = 1 + Math.min(veg * per600 / 350, 1) * 0.7 + Math.min(prot * per600 / 40, 1) * 0.7
      + (protein && ing[protein].pg === 'fish' ? 0.35 : 0);
    return { r, lines, portions, added, saved, perPortion: added / portions, savedPP: saved / portions, add, protein, quality,
      carb: lines.find(k => CARBS.includes(k)), kcal: kcal / r.base };
  }

  // Who eats at home: portions for a meal on a day (opts.eaters[day][type], each person counted by
  // their share of the household's calories). Default: everyone, every meal.
  let eat = () => 1;
  const portionsOf = slot => slot.days.reduce((n, d) => n + eat(d, slot.type), 0);

  // Turn the week's healthy/treat pattern into slots: one recipe each, covering one or more days.
  // A meal nobody eats at home that day gets no slot.
  function slotsFor(treat) {
    const kind = d => (treat[d] ? 'treat' : 'healthy'), home = (d, t) => eat(d, t) > 0, slots = [];
    let pairs = 0;
    for (let d = 0; d < 7;) {
      const k = kind(d);
      if (!home(d, 'dinner')) { d++; continue; }
      if (k === 'healthy' && d + 1 < 7 && kind(d + 1) === k && home(d + 1, 'dinner') && pairs < MAX_PAIRS) { slots.push({ type: 'dinner', kind: k, days: [d, d + 1] }); pairs++; d += 2; }
      else { slots.push({ type: 'dinner', kind: k, days: [d] }); d++; }
    }
    for (const type of ['lunch', 'breakfast']) for (const k of ['healthy', 'treat']) {
      const days = [...Array(7).keys()].filter(d => kind(d) === k && home(d, type));
      const n = Math.min(ROTATE[k], days.length);
      for (let i = 0; i < n; i++) slots.push({ type, kind: k, days: days.filter((_, j) => j % n === i) });
    }
    // Bigger slots first: they buy the packs the smaller ones then use up.
    return slots.sort((a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type) || b.days.length - a.days.length);
  }

  // cheap: a meal is ranked purely by what it adds to the shop (offers count only through their
  // lower price). Otherwise quality leads, cost only nudges, and meals get some credit for the
  // discounts they use, so that mode leans towards the avis.
  const DEAL = { cheap: 0, quality: 0.6 };
  let cheap = true;
  const net = (cost, saved) => cost - (cheap ? DEAL.cheap : DEAL.quality) * saved;
  const rank = c => (cheap ? net(c.perPortion, c.savedPP) : (Math.max(0, net(c.perPortion, c.savedPP)) + 12) / (c.quality * c.quality)) * jitter(c.r.id);
  const qOf = p => p.chosen.reduce((s, c) => s + c.quality * c.portions, 0) / p.portions;
  const score = p => cheap ? net(p.total, p.saved) / p.portions : (Math.max(0, net(p.total, p.saved)) / p.portions + 12) / Math.pow(qOf(p), 2);

  // A slot is named by its meal and days ("dinner:0,1"), so a meal the visitor picked stays put for
  // as long as the week has that slot.
  const slotKey = slot => `${slot.type}:${slot.days.join(',')}`;
  const fits = (r, slot) => r.type === slot.type && kindOf(r) === slot.kind && !(slot.days.length > 1 && r.leftovers === false);

  function greedy(people, slots, size, opener, fixed) {
    let need = {};
    const chosen = [], used = new Set(Object.values(fixed)), protein = new Set(), family = {}, carbs = {};
    for (const [i, slot] of slots.entries()) {
      const portions = portionsOf(slot), pinned = fixed[slotKey(slot)];
      const pick = fit => recipes.filter(r => (pinned ? r.id === pinned : (i > 0 || !opener || r.id === opener) && !used.has(r.id)) && fit(r, slot))
        .map(r => evaluate(r, need, portions, size)).filter(Boolean);
      // A treat day may fall back to a healthy recipe when the treats run out (gluten-free mode).
      let pool = pick(fits);
      if (!pool.length && !pinned && slot.kind === 'treat') pool = pick((r, sl) => fits(r, { ...sl, kind: 'healthy' }));
      const ok = c => {
        const [lo, hi] = KCAL[slot.type];
        if (c.kcal < lo || c.kcal > hi) return false;
        if (slot.type === 'dinner') {
          if (c.protein && (protein.has(c.protein) || (family[ing[c.protein].pg] || 0) >= 2)) return false;
          if (c.carb && (carbs[c.carb] || 0) >= 2) return false;
        } else if (c.protein && protein.has(c.protein) && pool.some(o => o.protein !== c.protein)) return false;
        return true;
      };
      const allowed = !pinned && pool.filter(ok).length ? pool.filter(ok) : pool;
      const best = allowed.sort((a, b) => rank(a) - rank(b))[0];
      if (!best) return null;
      chosen.push({ ...best, slot });
      need = { ...need }; for (const k in best.add) need[k] = (need[k] || 0) + best.add[k]; used.add(best.r.id);
      if (slot.type === 'dinner') {
        if (best.protein) { protein.add(best.protein); const g = ing[best.protein].pg; family[g] = (family[g] || 0) + 1; }
        if (best.carb) carbs[best.carb] = (carbs[best.carb] || 0) + 1;
      }
    }
    const portions = chosen.reduce((s, c) => s + c.portions, 0);
    // Savings of the final shop: every offer pack bought, against its normal price.
    const saved = Object.entries(need).reduce((s, [k, g]) => { const c = coverK(k, g); return s + (c.o?.onSale && c.o.normal ? c.n * (c.o.normal - c.o.price) : 0); }, 0);
    return { chosen, need, total: shopCost(need), portions, saved };
  }

  // people: household size; treat: 7 booleans (day 0 = first day of the offer week); kcal: per person
  // per day; opts.cheap: prioritise the cheapest week (default) or the most nourishing one;
  // opts.fixed: { slotKey: recipeId } meals the visitor picked themselves.
  function plan(people, treat = Array(7).fill(false), kcal = 2000, opts = {}) {
    cheap = opts.cheap !== false; stock = opts.stock || {};
    const eaters = opts.eaters || null;
    eat = (d, t) => eaters ? (eaters[d]?.[t] ?? people) : people;
    const slots = slotsFor(treat), byId = Object.fromEntries(recipes.map(r => [r.id, r]));
    // Keep only picks that still fit their slot (the week's treat days may have changed since).
    const fixed = {};
    const allowed = (r, slot) => fits(r, slot) || (slot.kind === 'treat' && fits(r, { ...slot, kind: 'healthy' }));
    for (const slot of slots) { const id = opts.fixed?.[slotKey(slot)]; if (byId[id] && allowed(byId[id], slot)) fixed[slotKey(slot)] = id; }
    if (!slots.length) return null;
    const dayKcal = chosen => chosen.reduce((s, c) => s + c.kcal * c.slot.days.length, 0) / 7;
    // Meals eaten out still count towards the day: size the home meals for their usual share of it.
    const SHARE = { breakfast: 0.25, lunch: 0.3, dinner: 0.45 };
    const homeShare = slots.reduce((s, sl) => s + SHARE[sl.type] * sl.days.length, 0) / 7;
    let best, size = 1;
    // Try opening the week with every possible first dinner, then re-run only the best few while the
    // portion size settles (packs bought for the opener shape the rest of the week).
    let openers = fixed[slotKey(slots[0])] ? [null]
      : recipes.filter(r => fits(r, slots[0]) && !Object.values(fixed).includes(r.id)).map(r => r.id);
    for (let pass = 0; pass < 3; pass++) {
      const plans = openers.map(id => greedy(people, slots, size, id, fixed)).filter(Boolean).sort((a, b) => score(a) - score(b));
      openers = plans.slice(0, opts.openers || OPENERS).map(p => openers[0] === null ? null : p.chosen[0].r.id);
      best = plans[0] || greedy(people, slots, size, null, fixed);
      if (!best) return null;
      best.size = size;
      const next = Math.min(2.6, Math.max(0.5, kcal * homeShare / dayKcal(best.chosen)));
      if (Math.abs(next - size) < 0.02) break;
      size = next;
    }
    const days = Array.from({ length: 7 }, (_, d) => ({ treat: !!treat[d] }));
    for (const c of best.chosen) {
      const key = { breakfast: 'b', lunch: 'l', dinner: 'd' }[c.slot.type];
      c.slot.days.forEach((d, j) => { days[d][key] = c.r.id; if (c.slot.type === 'dinner') days[d].left = j > 0; });
    }
    const onSale = Object.entries(best.need).reduce((s, [k, g]) => { const c = coverK(k, g); return s + (c.o?.onSale ? c.cost : 0); }, 0);
    const quality = best.chosen.reduce((s, c) => s + c.quality * c.portions, 0) / best.portions;
    // The search sizes each pass for the previous pass's meals; size the week it settled on properly
    // (same meals, portions that meet the calorie target) and price that.
    if (Object.keys(fixed).length < slots.length)
      return plan(people, treat, kcal, { ...opts, fixed: Object.fromEntries(best.chosen.map(c => [slotKey(c.slot), c.r.id])) });
    size = best.size;
    return { people, treat, target: kcal, cheap, stock, eaters, quality, saved: best.saved, size, kcal: Math.round(dayKcal(best.chosen) * size), total: best.total, onSale, portions: best.portions, need: best.need,
      cook: Object.fromEntries(best.chosen.map(c => [c.r.id, c.portions])),
      pick: Object.fromEntries(best.chosen.map(c => [c.r.id, c.lines])), days, fixed,
      slots: Object.fromEntries(best.chosen.map(c => [c.r.id, slotKey(c.slot)])),
      meals: best.chosen.map(c => ({ id: c.r.id, key: slotKey(c.slot), slot: c.slot, add: c.add })) };
  }

  // Every other recipe that could take this meal's place, with what the week's shop would cost
  // with it there and the rest of the week kept as it is (portions re-sized to the calorie target,
  // so the price is exactly what picking it gives). Cheapest first.
  function alternatives(p, id) {
    const meal = p.meals.find(m => m.id === id);
    if (!meal) return [];
    eat = (d, t) => p.eaters ? (p.eaters[d]?.[t] ?? p.people) : p.people;
    const portions = portionsOf(meal.slot), [lo, hi] = KCAL[meal.slot.type];
    const inWeek = new Set(p.meals.map(m => m.id)), all = Object.fromEntries(p.meals.map(m => [m.key, m.id]));
    const out = [];
    for (const r of recipes) {
      if (inWeek.has(r.id) || !fits(r, meal.slot)) continue;
      const c = evaluate(r, {}, portions, p.size);
      if (!c || c.kcal < lo || c.kcal > hi) continue;
      const q = plan(p.people, p.treat, p.target, { cheap: p.cheap, stock: p.stock, eaters: p.eaters, fixed: { ...all, [meal.key]: r.id } });
      if (!q) continue;
      const kcal = q.meals.find(m => m.id === r.id) && c.kcal * q.size;
      out.push({ id: r.id, delta: q.total - p.total, total: q.total, kcal: Math.round(kcal), family: c.protein ? ing[c.protein].pg : 'veg', quality: c.quality });
    }
    cheap = p.cheap; stock = p.stock;
    return out.sort((a, b) => a.delta - b.delta);
  }

  return { plan, alternatives };
}

// Gluten-free mode: ingredients that can contain gluten keep only their gluten-free packs (checked
// products, or a gluten-free stand-in such as gluten-free pasta), and recipes keep only the
// alternatives still available; a recipe with a line nothing gluten-free can fill is left out.
export function glutenFree({ recipes, ing }) {
  const gIng = {};
  for (const [k, d] of Object.entries(ing)) {
    if (!d.gluten) gIng[k] = d;
    else if (d.gfOptions?.length) gIng[k] = { ...d, n: d.gfN || d.n, options: d.gfOptions };
  }
  // Some share a stand-in (toast and rye bread are both gluten-free bread), so it's bought once.
  const swap = k => ing[k]?.gfAs && gIng[ing[k].gfAs] ? ing[k].gfAs : k;
  const lines = r => r.ing.map(([spec, g]) => [[...new Set(spec.split('|').map(swap))].filter(k => gIng[k]).join('|'), g]);
  const named = r => r.ing.some(([spec]) => spec.split('|').includes('pasta')) ? {
    name: r.name.replace(/whole-grain (spaghetti|pasta|penne|fusilli)/i, (m, w) => `${m[0] === 'W' ? 'G' : 'g'}luten-free ${w}`),
    dk: r.dk.replace(/fuldkorns(pasta|spaghetti)/i, (m, w) => `${m[0] === 'F' ? 'G' : 'g'}lutenfri ${w}`) } : {};
  return { ing: gIng, recipes: recipes.map(r => ({ ...r, ...named(r), ing: lines(r) })).filter(r => r.ing.every(([spec]) => spec)) };
}
