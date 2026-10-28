# Canvas — Image toolkit & converter

`Canvas/` now has two workspaces: Format converter (default, `#convert`) and the existing Image editor (`#editor`). The converter processes original queued files; editing one opens its original in the editor without silently changing other batch items. Both process locally, without document uploads, accounts, or runtime image APIs. The collection's shared styles may fetch Google Fonts.

## Batch conversion

- JPG ↔ PNG, image → WebP, and any supported input to PNG/JPG/WebP.
- PNG/JPEG/WebP/AVIF/GIF/BMP inputs, subject to browser decoding support. Animated images become a single still frame; metadata may not be retained. HEIC, SVG, and PDF are not accepted.
- Native encoders are checked by actual Blob MIME type. Unsupported encoding reports a per-image error; it never silently saves another format with the requested extension.
- PNG/WebP preserve alpha; JPG composites onto the chosen background. Quality controls apply to JPG/WebP. PNG is lossless but cannot recover information lost by an earlier JPG encoding.
- Keep dimensions or fit the longest edge without upscaling or changing aspect ratio. Exports may become larger than inputs; actual sizes are shown.
- Sequential conversions, individual errors, stopping after the current image, individual downloads, and a ZIP with collision-safe names.
- Limits: 20 images, 30 MB per file, 60 MB source input per queue, 24 MP per image, 8192 pixels per output side, and 100 MB total encoded output per batch. Queues and outputs stay in tab memory and clear on reload/close. Downloaded files and originals remain on the device.

Settings changes invalidate old results so stale files cannot be downloaded under a new format selection. Processing uses bounded per-image canvases and thumbnail previews rather than retaining full-resolution decoded images for the entire queue. The existing editor retains its own 30 MB / 24 MP input and 20 MP export limits.

## Dependencies and tests

ZIP output uses locally bundled [JSZip 3.10.1](https://stuk.github.io/jszip/), used under its MIT license (`vendor/JSZIP-LICENSE.md`). No build step is needed. Serve over HTTP(S) for local testing.

Run `node Canvas/conversion-test.cjs` for dimension/aspect-ratio limits, no-upscale behavior, input/format validation, filename collisions, and UI hook checks. Browser QA additionally verifies PNG alpha, JPG matte colors, native WebP output, ZIP contents, resizing, and the existing editor.
