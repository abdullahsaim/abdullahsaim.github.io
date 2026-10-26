# Atlas geography data

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
