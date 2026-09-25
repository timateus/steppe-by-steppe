# Steppe by Steppe

A [Travle](https://travle.earth/)-style route game for Central Asia. You get a start region and an end region, and you name the regions in between, crossing Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan and Uzbekistan one land border at a time.

Open `index.html` in a browser to play. It's a single self-contained file with no server needed.

## How it plays

- Each guess is coloured by how far it is from a shortest route: green (on one), yellow (+1 step), orange (+2), red (+3 or more).
- You get the shortest route's length plus 4 guesses.
- **Hint** outlines a region on the best remaining route. **Show borders** reveals every region's outline. Neither uses a guess, but both appear in the shared result (💡, 🗺️).
- After each guess, a one-line fact about the region pops up on the map ("btw, …"). Tap any coloured region for another.
- The interface is in **English and Russian** (EN/RU switch in the header). Region names can be typed in either language or in the local official form.
- Typing a country (or its people: "Kazakh", "узбек", "қазақ") lists all of that country's regions.
- **Statistics:** each player's daily games (played, win %, streak, results by guesses over the shortest route) are kept in their browser. With the stats Worker deployed, everyone also sees how many people played today's route, how many made it and the average score.
- **Daily** gives everyone the same route each day (seeded by the date). **Practice** gives unlimited random routes.

## The 55 regions (as of September 2026)

| Country | Divisions |
|---|---|
| Kazakhstan (20) | 17 regions, including Abai, Jetisu and Ulytau from the 2022 reform, plus the cities Astana, Almaty and Shymkent |
| Kyrgyzstan (9) | 7 regions plus the cities Bishkek and Osh |
| Tajikistan (5) | Sughd, Khatlon, Gorno-Badakhshan AR, Districts of Republican Subordination, and Dushanbe |
| Turkmenistan (7) | 5 welaýats plus Ashgabat and Arkadag (Arkadag has welaýat status but no ISO 3166-2 code yet) |
| Uzbekistan (14) | 12 regions, the Republic of Karakalpakstan, and Tashkent city |

Each region is shown by the English name its government uses, with the official local-language name next to it. The input also accepts local names and common older spellings.

## Region facts

The facts shown in the game are the short one-liners in `data/short_facts.json` (English and Russian), plus size and population rankings that `scripts/build_data.py` generates from the official figures. A ranking such as "the 2nd biggest region in Kazakhstan" is only generated when it isn't within 3% of the next region's figure.

`data/facts.json` holds each region's Russian name, capital, population (with year), area and longer reference facts.

- **Population:** national statistics offices, each with the year of the figure. Kazakhstan: Bureau of National Statistics (stat.gov.kz), 2022. Kyrgyzstan: National Statistical Committee (stat.gov.kg), 2025 (Osh city: 2022 census). Tajikistan: Agency on Statistics (stat.tj), 2022 (Dushanbe: 2023). Turkmenistan: 2022 census. Uzbekistan: National Statistics Committee (stat.uz), 2026.
- **Area:** official figures for regions. The 11 cities use areas measured from their current OpenStreetMap limits, marked "≈".
- **Facts:** well-established history, geography and landmarks, cross-checked against Wikipedia and UNESCO listings. Edit the file and run `./build.sh` to change them.

## Shared daily statistics

`worker/` is a small Cloudflare Worker with a D1 (SQLite) database, on Cloudflare's free plan. The page sends one result per player per daily route and reads back today's totals. Only a random per-browser id and the game result are stored: no names or IP addresses.

The **Deploy stats server** GitHub Action (`.github/workflows/stats-worker.yml`) creates the database, deploys the Worker, and writes its address to `stats.json`, which the page reads. It runs when `worker/` changes, or by hand from the Actions tab. One-time setup, all in the browser:

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) and open **Workers & Pages** once, so your `workers.dev` subdomain is created.
2. Copy your **Account ID** (Workers & Pages overview, right-hand side).
3. Create an API token at **My Profile → API Tokens → Create Token**: start from the **Edit Cloudflare Workers** template, add the permission **Account → D1 → Edit**, and create it.
4. In this repo, go to **Settings → Secrets and variables → Actions** and add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
5. Go to **Actions → Deploy stats server → Run workflow**.

The claude.ai version can't reach outside services, so it shows personal statistics only.

## Data and build

Boundaries are © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, licensed under the ODbL. The OSM relation IDs are listed in `data/osm_relation_ids.txt`, and the raw GeoJSON is kept in `data/raw/`.

Two regions count as neighbours if they share at least about 2 km of land border (0.02° in `scripts/build_geo.py`), so corners that only touch at a point don't count. Cities with regional status that sit inside a single region connect only to that region.

To rebuild:

```bash
pip install -r requirements.txt   # shapely
npm install                       # mapshaper
./scripts/fetch.sh                # optional: re-download boundaries from OSM
./build.sh                        # writes index.html (pass -v to print border lengths)
```

Region names, aliases and ISO codes live in `scripts/build_geo.py`. The game's UI and logic are in `src/template.html`.
