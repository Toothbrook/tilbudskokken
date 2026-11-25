# Tilbudskøkken

A free website with a full week of meals built from REMA 1000's offers: 7 breakfasts, lunches and dinners for however many people you are (1–8), with calories, protein, one shopping list for the week, and a list of every food offer. Some dinners are cooked once and eaten as leftovers the next evening. You can switch breakfast, lunch or dinner off if you don't need them.

The recipes are healthy by design: whole ingredients, no processed meat (sausages, bacon, medister, leverpostej), no ready-made sauces or spice mixes, whole-grain pasta and rye bread, plenty of vegetables, fish and beans. Each week the build reads the ingredient declaration of every product it would pick and skips products with additives worth avoiding (nitrite, phosphates, sweeteners, glutamate, colourings and similar E-numbers) whenever a cleaner product exists. Everyone in the household gets their own row with a name and a daily calorie target. The planner cooks for the household's total, and each meal shows how big each person's serving is.

Any day can be switched to a **treat day**, which uses a separate set of comfort-food classics (`kind: 'treat'` in `recipes.mjs`). A **Cheapest week** switch picks the lowest price when on, and favours vegetables, protein and fish when off.

The site **remembers your week**: your settings and the meals planned for them are saved in your browser for the whole offer week, so coming back on Wednesday shows the same days (it opens at today's). Prices may be refreshed, but the meals stay. The scheduled Monday run only rebuilds when Sunday's failed (`--if-stale`), so the data doesn't change mid-week either.

Pick a **shopping day** and the 7 days run from it (shopping Wednesday: Wednesday to Tuesday). The build keeps last week's data as `data/prev-week.json`, so until your next shopping day comes round the site shows the week you're still eating, with a link to peek at the next one. **Shop today instead** starts the new plan early, from today, for that one week (with an undo); the week after goes back to the usual day.

**Left over from last week** is used first. When a new week starts, the site rebuilds last week's shop from the meals it remembered for you (only the items you ticked, if you ticked any) and keeps what should still be in the cupboard: dry goods, spices, oil, roots, apples, butter, eggs, hard cheese and frozen food as they are, tins and other packs only if unopened. Fresh meat, fish, milk and bread don't carry over. The planner treats it as free, so the new week leans on it, the shopping list asks only for the rest, and a "Left from last week" section lists it with a **used up** button.

**Netto too** adds Netto's weekly offers (from Tjek / eTilbudsavis): the planner buys an item at Netto when its offer beats REMA, and the shopping list splits into a Netto part and a REMA part. Only offers (Netto's normal prices aren't public) and only plain foods: Tjek shows no ingredient lists, so sausages, cold cuts, sauces, spices and bread stay at REMA, where additives and gluten are checked. What matched is in `data/prices.json` under `netto`.

Any meal can be **swapped**: the site lists every other recipe that fits those days, with exactly what the week's shop would cost with it (the rest of the week stays as it is), filterable by fish, chicken, pork, beef or vegetarian. Picks are remembered for the week, and changing the household, calories or treat days re-plans around them.

A **Gluten-free** switch keeps only meals that can be made without gluten. Bread, pasta, oats, flour, noodles, tortillas and soy sauce are swapped for gluten-free products the build finds at REMA (labelled glutenfri, or rice noodles, corn tortillas and tamari), with an estimated price for staples REMA doesn't list that week. Things that can hide gluten (sausages, cold cuts, spices, stock, sauces, pulses, nuts) are only used when REMA's ingredient list for that product shows no gluten and no "may contain traces". The rules are `GLUTEN` in `scripts/recipes.mjs`; what each product was judged is in `data/prices.json` under `gluten`.

The **shopping list** follows a walk through the store: fruit & veg, bread, meat, fish & cold cuts, dairy, cheese & eggs, dry goods, spices, oil & sauces, and frozen. Each product goes under REMA's own department where that says frozen, fresh or bread, so frozen fish ends up with the frozen food. Offers are marked TILBUD.

The planning runs in the visitor's browser (`planner.js`, shared with the weekly build), so changing who's eating, their calories, treat days or the cheap switch re-plans the week instantly.

Nothing is assumed to be in the cupboard. Every ingredient, salt, oil and spices included, is priced at REMA (offer price or normal shelf price) and bought in whole packs. Meals are picked by how little they add to the total shop, purely on price when "Cheapest week" is on, so packs bought for one meal get used up by the others. Pack sizes round differently for 1 person and for 6, so the build makes a separate cheapest plan for each household size.

Every Sunday morning a GitHub Action reads the new REMA 1000 avis, reads REMA's normal shelf prices, and picks the combination of recipes from the recipe bank that makes the whole week's shop cheapest per portion. Then it redeploys the site. Anyone with the link can open it, no login.

## Set it up (about 5 minutes)

1. Create a new **public** repository on GitHub, e.g. `tilbudskoekken`. (GitHub Pages is free for public repos.)
2. Upload everything in this folder to it (drag and drop on the repo page works, or `git push`). Keep the folder structure, including `.github/workflows/`.
3. In the repo go to **Settings → Pages**, and under *Build and deployment → Source* choose **GitHub Actions**.
4. Go to **Settings → Actions → General → Workflow permissions** and choose **Read and write permissions**, so the weekly job can save the new plan.
5. Go to the **Actions** tab, pick **Weekly meal plan**, and click **Run workflow**.

When it finishes, the site is at `https://<your-username>.github.io/<repo-name>/`. Share that link.

## How it works

| File | What it does |
| --- | --- |
| `planner.js` | The week planner, shared by the build and the site. |
| `index.html` | The site. Loads `data/week.json` and plans the week live. Portions, ticks and your calorie target are remembered in the visitor's browser. |
| `scripts/offers.mjs` | Reads every product labelled "Avisvare" from REMA's product API (the one shop.rema1000.dk uses). Falls back to reading the avisvarer pages, then the Tjek / eTilbudsavis API. |
| `scripts/recipes.mjs` | The ingredient catalogue (nutrition per 100 g + rules for recognising each ingredient in the avis) and the recipe bank. |
| `scripts/recipes/*.mjs` | The rest of the recipe bank, about 200 recipes in all: healthy dinners, lunches and breakfasts, and treat-day classics. |
| `scripts/check-recipes.mjs` | Checks the recipe bank: known ingredient keys, sensible calories per portion, no treat-only ingredients on healthy days, and every seasoning, fat or liquid a method mentions is on the ingredient list. |
| `scripts/build-week.mjs` | Prices every ingredient (cheapest pack on offer or on the shelf), picks the cheapest varied week, writes `data/week.json` and `data/prices.json` (which product each ingredient matched, for checking). |
| `.github/workflows/weekly.yml` | Runs the build Sunday 06:17 (and Monday as a retry), commits the plan, deploys to Pages. |

To refetch offers outside the Sunday schedule, use **Run workflow** in the Actions tab, or put `[rebuild]` in a commit message.

If REMA changes their website and the offers can't be read, the run is marked failed (GitHub emails you), and the site keeps showing the last good plan with a note that it's out of date.

## Adding recipes

Add an entry to one of the files in `scripts/recipes/` (or `RECIPES` in `scripts/recipes.mjs`). Ingredient lines are `[key, grams]` for the whole recipe, and must include everything the method uses (salt, oil, spices). Add `leftovers: false` to dinners that don't keep (fried eggs, fish). `'hkokse|hkgris'` means "whichever is cheapest". Run `node scripts/check-recipes.mjs` and fix what it reports, then push and the next run can pick it.

## Run it locally

```bash
node scripts/build-week.mjs                                    # live offers
node scripts/build-week.mjs --offers fixtures/offers-uge45-2026.json   # saved test data
npx serve .                                                    # then open http://localhost:3000
```

Needs Node 20 or newer. No dependencies.

Calories are estimates from typical nutrition values per ingredient, not from REMA's own labels.
