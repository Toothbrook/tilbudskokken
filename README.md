# Tilbudskøkken

A free website with a weekly meal plan built from REMA 1000's offers: 4 dinners, 3 breakfasts and 3 lunches, with calories, protein, a shopping list priced at offer prices, and a list of every food offer that week.

Every Sunday morning a GitHub Action reads the new REMA 1000 avis, works out which ingredients are on offer, picks the recipes from the recipe bank that use the most of them, and redeploys the site. Anyone with the link can open it, no login.

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
| `scripts/build-week.mjs` | Matches offers to ingredients, scores every recipe by how much of it is on offer, picks a varied set, writes `data/week.json`. |
| `.github/workflows/weekly.yml` | Runs the build Sunday 06:17 (and Monday as a retry), commits the plan, deploys to Pages. |

To refetch offers outside the Sunday schedule, use **Run workflow** in the Actions tab, or put `[rebuild]` in a commit message.

If REMA changes their website and the offers can't be read, the run is marked failed (GitHub emails you), and the site keeps showing the last good plan with a note that it's out of date.

## Adding recipes

Open `scripts/recipes.mjs` and add an entry to `RECIPES`. Ingredient lines are `[key, grams]` for the whole recipe; `'hkokse|hkgris'` means "whichever of these is on offer". Push the change and the next run can pick it.

## Run it locally

```bash
node scripts/build-week.mjs                                    # live offers
node scripts/build-week.mjs --offers fixtures/offers-uge45-2026.json   # saved test data
npx serve .                                                    # then open http://localhost:3000
```

Needs Node 20 or newer. No dependencies.

Calories are estimates from typical nutrition values per ingredient, not from REMA's own labels.
