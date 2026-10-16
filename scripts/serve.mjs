import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { build, root } from './build.mjs';
await build();
const directory = resolve(root, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml' };
const headerText = await readFile(resolve(directory, '_headers'), 'utf8');
const headers = Object.fromEntries(headerText.split('\n').filter(line => line.startsWith('  ')).map(line => {
  const index = line.indexOf(':');
  return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
}));
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(directory + sep) || pathname.startsWith('/_')) {
      response.writeHead(404, headers); response.end(); return;
    }
    let content;
    try { content = await readFile(file); }
    catch { response.writeHead(404, { ...headers, 'Content-Type': types['.html'] }); response.end(await readFile(resolve(directory, '404.html'))); return; }
    response.writeHead(200, { ...headers, 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(content);
  } catch { response.writeHead(400); response.end('Bad request'); }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
