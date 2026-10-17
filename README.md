# Crypto Conspiracy Bench

Cryptographic conspiracies resolved or contributed to by AI models, in either direction.

## Local development

Requires Node.js 22 or newer. There are **no package dependencies** and no installation step.

```sh
npm run dev
```

Open <http://127.0.0.1:4173>. The preview builds on startup; restart after source edits. Set `PORT` to change the port.

```sh
npm test
npm run build
```

The complete deployable site is in `dist/`. It contains static HTML, CSS, an SVG favicon, public data, a sitemap, a 404 page, and Cloudflare response headers. The chart is rendered to accessible inline SVG at build time. Everything works without JavaScript. No fonts, chart libraries, analytics, APIs, CDNs, or other third-party resources load at runtime. Source links are ordinary outbound navigation. Keep Cloudflare Web Analytics, Zaraz, and automatic script injection disabled to preserve this property.

## Deploy to Cloudflare Pages

Deploys on `main` to Cloudflare Pages at https://cryptoconspiracybench.org.

## Update results

Results are stored in `data/results.json`. The page template is `src/index.html`. See [result docs](data/RESULTS.md) and [favicon docs](IMAGES.md).

Verification experiments live in [`experimental/`](experimental/). The
[Skipjack experiment](experimental/skipjack/README.md) includes a reproducible
comparison of the claimed generator against the official F-table.
