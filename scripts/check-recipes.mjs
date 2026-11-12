#!/usr/bin/env node
// Checks recipes for the rules every Tilbudskøkken recipe must follow.
//   node scripts/check-recipes.mjs                    # the whole bank
//   node scripts/check-recipes.mjs scripts/recipes/x.mjs   # one batch file (default export: array)
import { INGREDIENTS, RECIPES } from './recipes.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const file = process.argv[2];
const batch = file ? (await import(pathToFileURL(path.resolve(file)).href)).default : null;
const list = batch || RECIPES;
const others = batch ? RECIPES.filter(r => !batch.some(b => b.id === r.id)) : [];
const KCAL = { dinner: [350, 1100], lunch: [250, 850], breakfast: [200, 700] };
// Healthy days use whole ingredients only: no processed meat, white bread or ready-made products.
const TREAT_ONLY = ['polser', 'bacon', 'medister', 'leverpostej', 'flaesk', 'skinke', 'brunsauce', 'bearnaise', 'tacokrydderi',
  'fond', 'revetost', 'muesli', 'toast', 'boller', 'wraps', 'burgerboller', 'pizzadej', 'taertedej', 'sukker', 'lasagne'];
// Words in a method that need a matching ingredient (nothing is assumed in the cupboard).
const NEEDS = [
  [/\bsalt/i, ['salt']], [/\boil\b|\boiled\b/i, ['olie']], [/(?<!peanut )\bbutter/i, ['smor']], [/\bgarlic/i, ['hvidlog']],
  [/\blemon/i, ['citron']], [/\bsugar/i, ['sukker']], [/\bflour/i, ['mel']], [/\bsoy/i, ['soja']], [/\bhoney/i, ['honning']],
  [/\bmustard/i, ['sennep']], [/\bvinegar/i, ['eddike']], [/\bcinnamon/i, ['kanel']], [/\bthyme/i, ['timian']], [/\bdill/i, ['dild']],
  [/\bchives/i, ['purloeg']], [/\bbasil/i, ['basilikum']], [/\boregano/i, ['oregano']], [/\bparsley/i, ['persille']],
  [/\bpaprika/i, ['paprika']], [/\bspidskommen|\bcumin/i, ['spidskommen']], [/\bkarry|\bcurry powder/i, ['karry']],
  [/\bginger/i, ['ingefaer']], [/\bbaking powder/i, ['bagepulver']], [/\byeast/i, ['gaer']], [/\bchili/i, ['chiliflager', 'tacokrydderi']], [/\btomato paste|\btomatpur/i, ['tomatpure']],
  [/\bmilk\b/i, ['maelk', 'kokosmaelk']], [/\begg/i, ['aeg']], [/\bblack pepper|\bsalt and pepper|\bsalt, pepper\b|\bwith pepper\b|\bplenty of pepper/i, ['sortpeber']],
];
const BANNED = /\b(stock|broth|bouillon|ketchup|mayo|mayonnaise|nutmeg|rosemary|sesame|tahini|sriracha|worcester|maple|syrup|vanilla|wine|beer|capers|olives|pesto|breadcrumbs?)\b/i;

const errors = [], seen = new Set(others.map(r => r.id));
for (const r of list) {
  const e = m => errors.push(`${r.id || '?'}: ${m}`);
  if (!/^[a-z][a-z0-9-]{1,30}$/.test(r.id || '')) e('id must be lowercase letters, digits or hyphens');
  if (seen.has(r.id)) e('duplicate id'); seen.add(r.id);
  if (!['breakfast', 'lunch', 'dinner'].includes(r.type)) e('type must be breakfast, lunch or dinner');
  if (r.kind && !['healthy', 'treat'].includes(r.kind)) e('kind must be healthy or treat');
  for (const f of ['name', 'dk', 'time']) if (typeof r[f] !== 'string' || !r[f].trim()) e(`missing ${f}`);
  if (!Array.isArray(r.tags) || r.tags.length < 1 || r.tags.length > 3) e('tags: 1–3 short strings');
  if (!Number.isInteger(r.base) || r.base < 1 || r.base > 8) e('base must be an integer 1–8');
  if (!Array.isArray(r.steps) || r.steps.length < 1 || r.steps.length > 6) e('steps: 1–6 strings');
  if (!Array.isArray(r.ing) || r.ing.length < 2) { e('ing: at least 2 lines'); continue; }
  let kcal = 0; const keys = new Set();
  for (const line of r.ing) {
    if (!Array.isArray(line) || typeof line[0] !== 'string' || !(line[1] > 0)) { e(`bad ing line ${JSON.stringify(line)}`); continue; }
    const alts = line[0].split('|');
    for (const k of alts) { if (!INGREDIENTS[k]) e(`unknown ingredient "${k}"`); else keys.add(k);
      if ((r.kind || 'healthy') === 'healthy' && TREAT_ONLY.includes(k)) e(`"${k}" is treat-only; healthy recipes use whole ingredients`); }
    if (INGREDIENTS[alts[0]]) kcal += INGREDIENTS[alts[0]].kcal * line[1] / 100;
  }
  const per = kcal / r.base, [lo, hi] = KCAL[r.type] || [0, 1e9];
  if (per < lo || per > hi) e(`${Math.round(per)} kcal per portion, should be ${lo}–${hi}`);
  const text = (r.steps || []).join(' ');
  for (const [re, need] of NEEDS) if (re.test(text) && !need.some(k => keys.has(k))) e(`method mentions ${re.source.split('|')[0].replace(/\\b/g, '')} but the ingredients have none of ${need.join('/')}`);
  const banned = text.match(BANNED); if (banned) e(`method uses "${banned[0]}", which isn't an ingredient we have`);
  if (r.base > 1 && !r.main && !(r.mixed && r.pieces)) e('shared dish (base > 1) needs main: what the shared part is called on a plate');
  if (r.pieces && !(Array.isArray(r.pieces[0]) && r.pieces[0].length === 2 && r.pieces[1] > 0)) e('pieces must be [[one, many], count, keys?]');
  if (r.sides && !Array.isArray(r.sides)) e('sides must be an array of ingredient keys');
}
if (errors.length) { console.log(errors.join('\n')); console.log(`\n${errors.length} problem(s) in ${list.length} recipes`); process.exit(1); }
const c = {}; list.forEach(r => { const k = `${r.kind || 'healthy'} ${r.type}`; c[k] = (c[k] || 0) + 1; });
console.log(`OK: ${list.length} recipes`, c);
