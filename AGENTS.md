# Repository instructions

Whenever adding a new tool or application, update the homepage in the same change:

- Add its entry and preview to `assets/apps.js`, using the exact capitalization of the directory tracked by Git. GitHub Pages paths are case-sensitive even when the local Windows filesystem is not.
- Add its fallback link in the `noscript` section of `index.html`.
- Update any static app counts or collection descriptions in `index.html`. Keep runtime counts derived from the app list.
- Verify the new tool appears in homepage search and its category filter, and that its link resolves to the correct directory.

The homepage must always include the latest tool; adding the tool and updating the homepage are one task.
