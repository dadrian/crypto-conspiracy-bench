# Results data

Edit `results.json` in this directory to add or update an investigation. Each investigation contributes one point to its company; graph scores and result rows are generated from the same data. Do not maintain separate totals.

## Dataset fields

| Field | Meaning |
| --- | --- |
| `updated` | Date of the latest dataset change, in `YYYY-MM-DD` format. |
| `companies` | Company names and chart colors, in chart display order. |
| `results` | Documented investigations, displayed newest first by publication date. |

## Result fields

| Field | Meaning |
| --- | --- |
| `id` | Unique, stable identifier used as the result row's HTML anchor. |
| `company` | Exact name of a company in `companies`. |
| `title` | Short investigation title. |
| `date` | Publication date in `YYYY-MM-DD` format. |
| `direction` | Short resolution label displayed as a pill, such as “Evidence against a backdoor”. |
| `description` | Concise summary displayed beneath the title. |
| `caveat` | Limitations or remaining questions retained in the public dataset; not displayed in the result row. |
| `sources` | Nonempty array of source objects, each with a display `name` and an HTTPS `url`. All sources appear in the result row. |

Count an investigation once, even if it explains multiple curves or parameters. Use precise descriptions and preserve material limitations in `caveat`. Include primary sources where available; multiple sources do not add points.

After editing, update `updated`, then run these commands from the repository root:

```sh
npm test
npm run build
```

The build validates company attribution, unique result IDs, date format, and HTTPS sources. It generates the graph and table in `dist/index.html` and publishes the dataset as `dist/results.json`. The page template is `src/index.html`.
