# Folio — PDF Studio

A buildless, browser-local PDF page workspace at `PDF/`. Serve the repository over HTTP(S); PDF.js workers do not run from a `file://` page. No account, API, document upload, or runtime CDN is needed. Workspace documents stay in tab memory, not localStorage, and reload/close clears them. Fonts shared with the collection may be requested from Google Fonts; document bytes never leave the browser.

## Features

- Import multiple PDFs, PNG/JPEG/WebP images, or a built-in five-page demo.
- Lazy page thumbnails and a larger page preview with previous/next controls.
- Reorder by dragging or using accessible earlier/later buttons; reverse the full order.
- Select checkboxes or validated page ranges; rotate, duplicate, or remove pages.
- Thirty arrangement undo steps, including undo of imports and removing all pages.
- Merge all pages, extract selected pages in board order, or download a ZIP containing one PDF per page.
- Images become A4 pages, automatically portrait/landscape, with a white background and a 10 mm margin; no cropping. Browser-decoded image orientation is used consistently. Images are re-encoded for embedding; PDF page content is copied without whole-page rasterization.

## Limits and compatibility

25 MB per file, 60 MB total source input (including sources retained for undo), 20 source files, 200 current pages, and 24 megapixels per image. Document complexity can affect browser memory and processing time. Preview failures do not remove otherwise readable PDF pages from the export.

Encrypted/password-protected PDFs and interactive forms/signature fields are rejected with per-file messages, without changing the originals. Folio does not claim to preserve signatures, document-level bookmarks, attachments, or accessibility tags after page operations. It is a page organizer, not a PDF text editor or compression service. The interface describes these limits before export.

## Bundled libraries

- [pdf-lib 1.17.1](https://pdf-lib.js.org/) — MIT, page editing and PDF creation. License in `vendor/PDF-LIB-LICENSE.md`.
- [PDF.js 6.4.299](https://mozilla.github.io/pdf.js/) — Apache-2.0, legacy browser display/worker builds, locally bundled CMaps, fonts, WASM codecs, and ICC resources. Licenses remain in `vendor/pdfjs/` and its resource folders.
- [JSZip 3.10.1](https://stuk.github.io/jszip/) — MIT/GPLv3 dual license; used under MIT. License in `vendor/JSZIP-LICENSE.md`.

Versions are pinned in `dependencies/package.json` and `package-lock.json`. To reproduce vendored files, install with `npm ci --prefix PDF/dependencies --ignore-scripts`, copy the pdf-lib and JSZip `dist/*.min.js` files, copy PDF.js `legacy/build/pdf.min.mjs` and `pdf.worker.min.mjs` to `vendor/pdfjs/`, and include its `cmaps`, `standard_fonts`, `wasm`, `iccs`, and licenses. Node is only needed for maintenance/tests; the website itself needs no build.

## Verification

Run `node PDF/test.cjs`. Checks cover range validation, merge/selection order, cumulative rotations, unchanged originals, individual PDFs inside a split ZIP, unsupported forms/corrupt inputs, and UI hooks. Set `FOLIO_TEST_OUTPUT` to a temporary directory to write verification fixtures for independent PDF inspection and browser tests.
