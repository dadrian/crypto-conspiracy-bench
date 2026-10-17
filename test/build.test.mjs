import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { render, root, validate } from '../scripts/build.mjs';
const data = JSON.parse(await readFile(`${root}data/results.json`, 'utf8'));
const template = await readFile(`${root}src/index.html`, 'utf8');
test('graph and records use the same counts and company lineup', () => {
  const html = render(data, template);
  assert.deepEqual(data.companies.map(c => c.name), ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Moonshot']);
  assert.match(html, /OpenAI: 0; Anthropic: 2; Google: 0; Meta: 0; Moonshot: 0/);
  assert.equal((html.match(/<tr id=/g) || []).length, 2);
  assert.match(html, /https:\/\/www.anthropic.com\/research\/ecdsa-curve-origins/);
  assert.doesNotMatch(html, /Evaluator|<!-- (CHART|RECORDS|UPDATED) -->/);
});
test('new results update totals automatically', () => {
  const next = structuredClone(data);
  next.results.push({ ...next.results[0], id: 'another-result', company: 'OpenAI' });
  assert.match(render(next, template), /OpenAI: 1; Anthropic: 2/);
});
test('unknown attribution and duplicate investigations fail validation', () => {
  const next = structuredClone(data);
  next.results[0].company = 'Unknown';
  assert.throws(() => validate(next), /Unknown company/);
  const duplicate = structuredClone(data);
  duplicate.results.push(duplicate.results[0]);
  assert.throws(() => validate(duplicate), /duplicate result ID/);
});
test('content is escaped and source URLs require HTTPS', () => {
  const next = structuredClone(data);
  next.results[0].title = '<script>alert(1)</script>';
  assert.match(render(next, template), /&lt;script&gt;/);
  next.results[0].sources[1].url = 'javascript:alert(1)';
  assert.throws(() => render(next, template), /HTTPS/);
});
test('page has no external runtime resources or scripts', async () => {
  const html = render(data, template);
  assert.doesNotMatch(html, /<script|@import|<iframe/i);
  for (const match of html.matchAll(/<(?:link|img|script)[^>]+(?:src|href)="([^"]+)"/g)) {
    if (match[0].includes('rel="canonical"')) continue;
    assert.ok(match[1].startsWith('/'), `External resource: ${match[1]}`);
  }
  const css = await readFile(`${root}public/style.css`, 'utf8');
  assert.doesNotMatch(css, /@import|url\(/);
});
