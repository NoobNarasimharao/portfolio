import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { portfolio } from '../src/data/portfolio.ts';
import { externalUrl, resumeUrl } from '../src/lib/urls.ts';

const root = path.resolve('dist');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
assert(!html.includes('__PAGE_') && !html.includes('https://example.com/'), 'Placeholder metadata in output');
assert(html.includes('Content-Security-Policy'), 'Production CSP missing');
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]).filter(url => !url.startsWith('https://'));
assert(references.some(url => url.endsWith('.js')), 'No generated JavaScript');
assert(references.some(url => url.endsWith('.css')), 'No generated CSS');
for (const reference of references) {
  const relative = reference.endsWith('/favicon.svg') ? 'favicon.svg' : reference.replace(/^.*?assets\//, 'assets/').replace(/^\.\//, '');
  assert(relative.startsWith('assets/') || relative === 'favicon.svg', `Unexpected local reference: ${reference}`);
  assert((await stat(path.join(root, relative))).isFile(), `Missing output asset: ${reference}`);
}
for (const value of [...portfolio.projects.map(p => p.github), ...portfolio.profiles.map(p => p.url), ...portfolio.works.map(w => w.url ?? '')].filter(Boolean)) {
  assert(externalUrl(value), 'Unsafe configured external URL');
}
for (const extension of ['pdf', 'docx']) {
  const value = portfolio.resume[extension];
  if (!value) continue;
  const url = resumeUrl(value, './', extension);
  assert(url, `Invalid ${extension} resume path`);
  assert((await stat(path.join(root, url))).isFile(), `Missing configured ${extension} resume`);
}
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file); else files.push(file);
  }
}
await walk(root);
for (const file of files) {
  assert(!/(?:^|[/\\])(?:\.env(?:\..*)?|_headers|node_modules|package(?:-lock)?\.json)$|\.(?:map|pem|key|p12)$/i.test(file), `Unexpected published file: ${file}`);
  if (/\.(?:html|js|css|xml|txt)$/.test(file)) {
    const text = await readFile(file, 'utf8');
    assert(!/-----BEGIN [A-Z ]*PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}|\bAKIA[A-Z0-9]{16}\b/.test(text), `Credential-like content in ${file}`);
  }
}
console.log(`Static output verified: ${files.length} files, ${references.length} local assets, configured links and resumes checked.`);
