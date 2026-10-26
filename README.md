# Abdullah Saim · App collection

A static collection of browser applications hosted on GitHub Pages.

The root `index.html` is the collection landing page. Solis lives at **`Weather/`** (capital W). The remaining applications live in `bmi/`, `clock/`, `gpa/`, `piano/`, `pos/`, `radio/`, and `task/`.

## Update the collection

Add or edit an entry in `assets/apps.js`. Each entry defines its name, category, description, destination, tags, and preview. The homepage generates app links, search results, filters, and the total count from this list. Add any new preview markup to `previews` in the same file. Update the no-JavaScript links in `index.html` when adding an application.

GitHub Pages paths are case-sensitive. Each application directory must contain an `index.html`. No build step or dependencies are required. Serve the repository with any static HTTP server for local preview.
