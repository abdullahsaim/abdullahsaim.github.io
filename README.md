# Abdullah Saim · App collection

A static collection of browser applications hosted on GitHub Pages.

The root `index.html` is the collection landing page. Solis lives at **`Weather/`** (capital W). The remaining applications live in `BMI/`, `clock/`, `GPA/`, `Piano/`, `POS/`, `radio/`, and `Task/`.

## Update the collection

Add or edit an entry in `assets/apps.js`. Each entry defines its name, category, description, destination, tags, and preview. The homepage generates app links, search results, filters, and the total count from this list. Add any new preview markup to `previews` in the same file. Update the no-JavaScript links in `index.html` when adding an application.

GitHub Pages paths are case-sensitive. Each application directory must contain an `index.html`. No build step or dependencies are required. Serve the repository with any static HTTP server for local preview.

## Forma unit converter

`Convert/` contains Forma, a browser-local unit converter covering length, weight, temperature, volume, speed, area, time, and digital storage. Conversion factors live in `Convert/units.js`; the interface lives in `Convert/app.js` and `Convert/style.css`. No API or build step is needed.

## Canvas and Words

- `Canvas/`: local image editing with drag-and-drop/paste, crop selection and keyboard-accessible crop fields, resize, rotation, flips, brightness/contrast/saturation, original comparison, and PNG/JPEG/WebP exports. Maximum input: 30 MB and 24 MP. Output: up to 8192 px per side and 20 MP. Animated inputs become a single frame. Export format support depends on the browser.
- `Words/`: live Unicode-aware text statistics, reading estimates, case conversions, line cleanup, literal find-and-replace, undo/redo, focus mode, and plain-text import/export. Text stays in tab memory. Import limit: 2 MB.

Shared styling lives in `assets/toolkit.css`. Neither tool needs a build step, API key, server processing, or user account.

## Atlas geography playground

`Atlas/` bundles 195 country profiles, local SVG flags, and a Natural Earth world map. Explore with search, region filters, pan/zoom, and saved countries; play capital, flag, map, mixed, or deterministic daily quizzes. Optional timers, difficulty levels, hints, answer review, and a browser-local passport are included. See `Atlas/SOURCES.md` and bundled licenses for data attribution. No runtime geography API or build step is required.

Atlas also includes country comparison and shareable links, typed-answer recall, targeted missed-answer practice, spaced reviews, capital flashcards, daily answer goals, seven-day activity, learning streaks, and detailed session summaries. These extensions live in `Atlas/advanced.js` and `Atlas/advanced.css`; the original v1 passport remains compatible.
