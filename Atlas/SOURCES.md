# Atlas geography data

## Organization map layers

Membership snapshot checked 26 October 2026. `organizations.js` records the official source for each group: [UN](https://www.un.org/en/about-us/member-states) (193), [G20](https://www.dfat.gov.au/trade/organisations/g20) (19 countries), [SCO](https://eng.sectsco.org/20170109/192193.html) (10), [EU](https://european-union.europa.eu/principles-countries-history/eu-countries_en) (27), [NATO](https://www.nato.int/cps/en/natohq/nato_countries.htm) (32), [ASEAN](https://asean.org/member-states/) (11), [G7](https://www.international.gc.ca/world-monde/international_relations-relations_internationales/g7/index.aspx?lang=eng) (7 countries), and [SAARC](https://www.saarc-sec.org/) (8). These eight tracked groups are not an exhaustive account of international memberships.

The EU and African Union are G20 members as regional bodies; their constituent countries do not automatically become direct country members. The EU also participates in the G7. Observers, dialogue partners, and summit guests are excluded from full-member maps. UN observer status for the Holy See is displayed on the bundled Vatican City profile; Palestine is also marked as an observer, per the [UN observer list](https://research.un.org/en/unmembers/observers). ASEAN includes [Timor-Leste's admission on 26 October 2025](https://asean.org/forging-a-new-era-timor-leste-admitted-into-asean/).

Map layers combine the six populated country regions with direct organization membership. Oceania wraps Pacific country geometry and markers across the dateline when fitted; world reset and quizzes restore the original world geometry. These are offline snapshots, with source links and dates visible in the interface; they do not update automatically. Shareable map filters use `#region=Asia&org=sco`. Additional profile coordinates are approximate reference points from the original country dataset.

Bundled snapshot prepared on 26 October 2026. Atlas makes no runtime geography API requests.

## Country facts

- Source: [mledoze/countries](https://github.com/mledoze/countries), `countries.json` from the `master` branch.
- License: Open Database License (ODbL) 1.0. The full license is included in `COUNTRIES-LICENSE.txt`.
- The adapted database in `data.js` is available under the same ODbL license. It selects entries marked as UN members in the source plus `VA` and `PS`, resulting in 195 profiles.
- Adaptations: selected common/official names, listed capitals, languages, currencies, area, border codes, and approximate coordinates; North and South America are separated using the source subregion; quiz familiarity and map eligibility fields were added. Multiple listed capitals are displayed together. Country facts reflect the bundled dataset rather than a live authoritative source.

## World map

- Source: [Natural Earth vector repository](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson), 1:110m Admin-0 countries.
- License: [public domain](https://www.naturalearthdata.com/about/terms-of-use/).
- Adaptations: projected into an equirectangular SVG coordinate system, rounded to one decimal place, reduced to country paths/labels, and Antarctica omitted from the interactive learning view.
- Borders are generalized and follow the source's boundaries. They do not represent an assertion of sovereignty. Some small countries have markers instead of visible polygons. Map quizzes use mapped countries with source area of at least 25,000 km² so targets remain identifiable.

## Flag artwork

- Source: [lipis/flag-icons](https://github.com/lipis/flag-icons), 4:3 SVG flag artwork from the `main` branch.
- License: MIT; full license in `FLAGS-LICENSE.txt`.
- Selected country flags are bundled in `flags/`. SVG files are unmodified.

## Application behavior

- Daily questions are seeded from the visitor's local calendar date and the bundled country list. They change at local midnight when the next round starts.
- Discoveries, saved places, cumulative answers, milestones, and recent completed rounds are kept in localStorage under `atlas-passport-v1`.
- Export creates a JSON copy of the browser-local passport. The Restore action validates that JSON file and asks before replacing the current browser-local passport.
- The quiz engine is independent of the interface in `engine.js`; flags and geography data stay available without external image services after the page and its local assets have loaded.

## Advanced learning and sharing

The v1 passport format is extended with optional `review`, `days`, and `goal` fields. Older passports retain all existing totals, discoveries, favorites, and history; missing learning records start empty. New history entries also record response style, practice kind, and total answer time.

Review records are separate for each country and quiz mode. Misses are eligible for spaced review after five minutes and are immediately available in missed-answer practice. A first correct recall schedules one day ahead, followed by 3, 7, 14, and 30 days on subsequent due reviews. Early repeats do not advance the interval. Correct answers clear the missed queue for that country/mode.

Flashcards use self-assessment to update review schedules and learning activity without changing quiz accuracy or correct-answer totals. Activity history and daily goals begin with answers recorded by this update; legacy global totals are preserved.

Typed answers ignore case, accents, spacing, and punctuation. Country common/official names and two-letter ISO codes are accepted; any listed capital is accepted for multi-capital countries. No fuzzy spelling matching is used.

Country comparison uses the bundled facts. Distances use a mean Earth radius of 6,371 km in a haversine calculation between country reference coordinates, not capitals or travel routes. Country links use `#country=FR`; comparisons use `#compare=FR,JP`. Both validate IDs against the bundled list.
