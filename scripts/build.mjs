import { readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function validate(data) {
  const companies = new Set(data.companies.map(c => c.name));
  if (companies.size !== data.companies.length) throw new Error('Duplicate company');
  const ids = new Set();
  for (const result of data.results) {
    if (!companies.has(result.company)) throw new Error(`Unknown company: ${result.company}`);
    if (!result.id || ids.has(result.id)) throw new Error('Missing or duplicate result ID');
    ids.add(result.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date) || Number.isNaN(Date.parse(result.date))) throw new Error('Invalid result date');
    if (!Array.isArray(result.sources) || !result.sources.length) throw new Error('At least one source is required');
    for (const source of result.sources) {
      if (new URL(source.url).protocol !== 'https:') throw new Error('Source must use HTTPS');
    }
  }
}

export function render(data, template) {
  validate(data);
  const scores = data.companies.map(c => ({ ...c, score: data.results.filter(r => r.company === c.name).length }));
  const max = Math.max(1, ...scores.map(c => c.score));
  const summary = scores.map(c => `${c.name}: ${c.score}`).join('; ');
  const grid = Array.from({ length: 5 }, (_, i) => {
    const y = 50 + i * 75;
    const value = max * (4 - i) / 4;
    return `<line x1="80" y1="${y}" x2="940" y2="${y}" class="grid"/>${Number.isInteger(value) ? `<text x="62" y="${y + 5}" class="tick" text-anchor="end">${value}</text>` : ''}`;
  }).join('');
  const bars = scores.map((c, i) => {
    const x = 166 + i * 172;
    const height = c.score / max * 300;
    return `<g><title>${escape(c.name)}: ${c.score} resolved conspiracies</title>${c.score ? `<rect x="${x - 40}" y="${350 - height}" width="80" height="${height}" fill="${c.color}"/>` : `<circle cx="${x}" cy="350" r="5" fill="${c.color}"/>`}<text x="${x}" y="${332 - height}" class="score" text-anchor="middle">${c.score}</text><text x="${x}" y="390" class="company" text-anchor="middle">${escape(c.name)}</text></g>`;
  }).join('');
  const chart = `<svg viewBox="0 0 1000 440" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Resolved cryptographic conspiracies by company</title><desc id="chart-desc">${escape(summary)}. Scores count documented results, not performance on a common evaluation.</desc>${grid}<text transform="translate(25 200) rotate(-90)" text-anchor="middle" class="axis">Score</text><line x1="80" y1="350" x2="940" y2="350" class="baseline"/>${bars}</svg>`;
  const records = [...data.results].sort((a, b) => b.date.localeCompare(a.date)).map(r => `<tr id="${escape(r.id)}"><th scope="row">${escape(r.company)}</th><td class="count">1</td><td class="description"><h3>${escape(r.title)}</h3><p>${escape(r.description)}</p><span class="direction">${escape(r.direction)}</span></td><td class="date"><time datetime="${r.date}">${r.date}</time></td><td class="sources">${r.sources.map(source => `<a href="${escape(source.url)}">${escape(source.name)} <span aria-hidden="true">↗</span></a>`).join('')}</td></tr>`).join('');
  return template.replace('<!-- CHART -->', chart).replace('<!-- RECORDS -->', records).replaceAll('<!-- UPDATED -->', escape(data.updated));
}

export async function build() {
  const data = JSON.parse(await readFile(`${root}data/results.json`, 'utf8'));
  const html = render(data, await readFile(`${root}src/index.html`, 'utf8'));
  await rm(`${root}dist`, { recursive: true, force: true });
  await mkdir(`${root}dist`, { recursive: true });
  await cp(`${root}public`, `${root}dist`, { recursive: true });
  await writeFile(`${root}dist/index.html`, html);
  await writeFile(`${root}dist/results.json`, `${JSON.stringify(data, null, 2)}\n`);
  console.log('Built static site in dist/');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
