# Tilbudskøkken

A free website with a full week of meals built from REMA 1000's offers: 7 breakfasts, lunches and dinners for however many people you are (1–8), with calories, protein, one shopping list for the week, and a list of every food offer. Some dinners are cooked once and eaten as leftovers the next evening. You can switch breakfast, lunch or dinner off if you don't need them.

Nothing is assumed to be in the cupboard. Every ingredient, salt, oil and spices included, is priced at REMA (offer price or normal shelf price) and bought in whole packs. Meals are picked by how little they add to the total shop, so packs bought for one meal get used up by the others. Pack sizes round differently for 1 person and for 6, so the build makes a separate cheapest plan for each household size.

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
| `index.html` | The site. Loads `data/week.json`. Portions, ticks and your calorie target are remembered in the visitor's browser. |
| `scripts/offers.mjs` | Reads every product labelled "Avisvare" from REMA's product API (the one shop.rema1000.dk uses). Falls back to reading the avisvarer pages, then the Tjek / eTilbudsavis API. |
| `scripts/recipes.mjs` | The ingredient catalogue (nutrition per 100 g + rules for recognising each ingredient in the avis) and the recipe bank. |
| `scripts/build-week.mjs` | Prices every ingredient (cheapest pack on offer or on the shelf), picks the cheapest varied week, writes `data/week.json` and `data/prices.json` (which product each ingredient matched, for checking). |
| `.github/workflows/weekly.yml` | Runs the build Sunday 06:17 (and Monday as a retry), commits the plan, deploys to Pages. |

To refetch offers outside the Sunday schedule, use **Run workflow** in the Actions tab, or put `[rebuild]` in a commit message.

If REMA changes their website and the offers can't be read, the run is marked failed (GitHub emails you), and the site keeps showing the last good plan with a note that it's out of date.

## Adding recipes

Open `scripts/recipes.mjs` and add an entry to `RECIPES`. Ingredient lines are `[key, grams]` for the whole recipe, and must include everything the method uses (salt, oil, spices). Add `leftovers: false` to dinners that don't keep (fried eggs, fish). `'hkokse|hkgris'` means "whichever is cheapest". Push the change and the next run can pick it.

## Run it locally

```bash
node scripts/build-week.mjs                                    # live offers
node scripts/build-week.mjs --offers fixtures/offers-uge45-2026.json   # saved test data
npx serve .                                                    # then open http://localhost:3000
```

Needs Node 20 or newer. No dependencies.

Calories are estimates from typical nutrition values per ingredient, not from REMA's own labels.
