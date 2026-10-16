# Social image and favicon

`public/og-image.svg` is the editable square social image. Open Graph advertises `public/og-image-1024.png` (1024 × 1024, preferred) and `public/og-image-4096.png` (4096 × 4096) with matching dimensions and alt text. Open Graph permits multiple images but the consuming service chooses which to use; this is not a responsive `srcset`.

`public/favicon-128.png` is the 128 × 128 raster favicon, rendered directly from `public/favicon.svg`. The SVG is also advertised with `sizes="any"` for resolution-independent display. Other PNG sizes are retained as exports. Pixel dimensions and vector rendering determine on-screen sharpness; DPI metadata does not improve browser or social-preview resolution. If you edit the vectors, regenerate the corresponding PNGs with an SVG rasterizer. The normal site build simply copies these assets and requires no image-processing dependencies.
