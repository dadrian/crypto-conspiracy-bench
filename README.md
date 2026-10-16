# Crypto Conspiracy Bench

Cryptographic conspiracies resolved by AI models, in either direction. Inspired by [FelonyBench](https://www.felonybench.com/), with its five-company lineup and a single model graph. No evaluator view.

Initial data: Anthropic **1**; OpenAI, Google, Meta, and Moonshot **0**. The single investigation is [ECDSA Curve Origins](https://www.anthropic.com/research/ecdsa-curve-origins), published October 16, 2026. The dataset retains the report's limitations.

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

**Nothing has been deployed or configured in Cloudflare.** Buying the domain does not create a Pages project. Performing the following steps will publish the site.

### Git integration

1. Commit and push this repository to GitHub (or GitLab).
2. In Cloudflare, open **Workers & Pages**, choose **Create application**, select the **Pages** flow, and connect this repository. Use the account containing `cryptoconspiracybench.org`.
3. Set the build configuration:

   | Setting | Value |
   | --- | --- |
   | Project name | `crypto-conspiracy-bench` (or another available name) |
   | Production branch | Your release branch, usually `main` |
   | Framework preset | None |
   | Root directory | Repository root (leave blank) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Build variable | `NODE_VERSION=22` |

4. Save and deploy. Check the generated `*.pages.dev` URL before attaching the domain. Future pushes to the production branch publish automatically; other branches can create previews according to your Pages settings.

No secrets, bindings, databases, Pages Functions, or runtime environment variables are required. See Cloudflare's [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/) and [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

### Attach cryptoconspiracybench.org

1. Confirm the domain is an active Cloudflare DNS zone in the same account as the Pages project. Since it was purchased through Cloudflare, check the existing zone and nameserver status.
2. In the Pages project, open **Custom domains → Set up a domain** and enter `cryptoconspiracybench.org`.
3. Complete the DNS confirmation flow. Cloudflare can create the apex CNAME to the project's `*.pages.dev` hostname. Review any conflicting apex records before changing them.
4. Wait for the custom domain and TLS certificate to become **Active**. Verify `https://cryptoconspiracybench.org/`, the source link, `/results.json`, and a nonexistent path (which should return the custom 404).

Associate the hostname in Pages before adding DNS yourself; a DNS record alone is insufficient. See [Cloudflare's custom domain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/).

The canonical URL, sitemap, and robots file already use the apex domain. Optionally add `www.cryptoconspiracybench.org` as another custom domain, then configure a Cloudflare redirect rule to the apex preserving paths and query strings. The production `*.pages.dev` address can also redirect through Cloudflare; keep branch previews usable.

### Alternative: direct upload

Instead of Git integration, build locally, create a **Direct Upload Pages** project in the dashboard, and upload the **contents** of `dist/` (or a zip with `index.html` at its root). Attach the domain using the same flow above. Choose Git integration for automatic repository builds; Cloudflare documents the project-type distinction in its [Direct Upload guide](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Update results

Edit `data/results.json`, run tests, and rebuild. Each result contributes one point to its company. Graph scores and table rows derive from the same data. Use a unique stable `id`, ISO publication date, precise summary and caveat, resolution direction, and a nonempty `sources` array of named HTTPS links. Update `updated` when changing the dataset. Company order and colors are defined in the same file.

Page structure is in `src/index.html`; styling and static files are in `public/`. `scripts/build.mjs` validates data and produces `dist/`. `scripts/serve.mjs` previews with the Cloudflare security headers, including a policy blocking third-party resources and scripts. Tests cover scoring, attribution, escaping, and runtime resource independence.

The reference site's layout inspired this implementation; its code and assets are not included. This project retains the repository's Apache 2.0 license.
