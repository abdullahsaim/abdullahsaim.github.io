# Abdullah Saim · App collection

A static collection of browser applications hosted on GitHub Pages.

The root `index.html` is the collection landing page. Solis lives at **`Weather/`** (capital W). The remaining applications live in `BMI/`, `clock/`, `GPA/`, `Piano/`, `POS/`, `radio/`, and `Task/`.

## Update the collection

Add or edit an entry in `assets/apps.js`. Each entry defines its name, category, description, destination, tags, and preview. The homepage generates app links, search results, filters, and the total count from this list. Add any new preview markup to `previews` in the same file. Update the no-JavaScript links in `index.html` when adding an application.

GitHub Pages paths are case-sensitive. Each application directory must contain an `index.html`. No build step or dependencies are required. Serve the repository with any static HTTP server for local preview.

## Palette color studio

`Palette/` is a browser-local color studio with editable and lockable swatches, five harmony schemes, undo/redo, a live design preview, gradient CSS, local image color extraction, and a WCAG 2.2 contrast checker. Palettes can be saved on the device, shared by URL, and exported as CSS, importable JSON, SVG, or PNG. The homepage includes Palette under Creative and derives the 13-app count from its catalog.

Color calculations and alpha-weighted image quantization live in `Palette/color.js`. Contrast uses the sRGB relative-luminance formula with unrounded pass/fail comparisons; displayed ratios are rounded. Results assess color contrast, not complete accessibility. Image processing uses a sample up to 160 pixels per side; input is limited to 20 MB and 24 MP. Transparent pixels are excluded; animated images use one frame. Browser storage is optional, with explicit errors and portable JSON exports. No build, API key, account, or image upload is required. See the checker’s linked [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Run `node Palette/test.cjs` for color-math and extraction checks.

## Forma unit converter

`Convert/` contains Forma, a browser-local unit converter covering length, weight, temperature, volume, speed, area, time, and digital storage. Conversion factors live in `Convert/units.js`; the interface lives in `Convert/app.js` and `Convert/style.css`. No API or build step is needed.

## Canvas and Words

- `Canvas/`: local image editing with drag-and-drop/paste, crop selection and keyboard-accessible crop fields, resize, rotation, flips, brightness/contrast/saturation, original comparison, and PNG/JPEG/WebP exports. Maximum input: 30 MB and 24 MP. Output: up to 8192 px per side and 20 MP. Animated inputs become a single frame. Export format support depends on the browser.
- `Words/`: live Unicode-aware text statistics, reading estimates, case conversions, line cleanup, literal find-and-replace, undo/redo, focus mode, and plain-text import/export. Text stays in tab memory. Import limit: 2 MB.

Shared styling lives in `assets/toolkit.css`. Neither tool needs a build step, API key, server processing, or user account.

## Atlas geography playground

`Atlas/` bundles 195 country profiles, local SVG flags, and a Natural Earth world map. Explore with search, region filters, pan/zoom, and saved countries; play capital, flag, map, mixed, or deterministic daily quizzes. Optional timers, difficulty levels, hints, answer review, and a browser-local passport are included. See `Atlas/SOURCES.md` and bundled licenses for data attribution. No runtime geography API or build step is required.

Atlas also includes country comparison and shareable links, typed-answer recall, targeted missed-answer practice, spaced reviews, capital flashcards, daily answer goals, seven-day activity, learning streaks, and detailed session summaries. These extensions live in `Atlas/advanced.js` and `Atlas/advanced.css`; the original v1 passport remains compatible.

Continent and organization map layers can be combined, framed, and shared. Country profiles show memberships in eight tracked groups, observer status where applicable, and additional geography details. Correct answers are highlighted in quiz explanations and session reviews. Membership snapshots and official sources are bundled in `Atlas/organizations.js`; map interactions live in `Atlas/map-layers.js`.

Profiles also show sourced population estimates (2024), majority religious affiliation and an expandable breakdown (Pew, 2020), and a clearly labeled historical state-religion classification (Pew, 2015). Missing source coverage is explicit; majority affiliation is kept distinct from official state status. The bundled snapshots work without runtime API calls.
