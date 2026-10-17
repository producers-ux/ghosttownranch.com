#!/usr/bin/env node
// Writes a tiny forwarding page for each old address in redirects.json.
// GitHub Pages can't do server redirects, so each page points search engines at the
// new address (canonical) and forwards visitors instantly (meta refresh + script).
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const SITE = 'https://ghosttownranch.com';
const map = JSON.parse(await readFile('redirects.json', 'utf8'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

let n = 0;
for (const [from, to] of Object.entries(map)) {
  if (from.startsWith('_')) continue;
  if (!from.startsWith('/') || !from.endsWith('/') || from.includes('..')) throw new Error(`Bad path: ${from}`);
  const dest = SITE + to;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved · Ghost Town Ranch</title>
<link rel="canonical" href="${esc(dest)}">
<meta http-equiv="refresh" content="0; url=${esc(dest)}">
<script>location.replace(${JSON.stringify(dest)} + location.search + location.hash);</script>
</head>
<body style="background:#141414;color:#F6F6F3;font-family:system-ui,sans-serif;padding:48px">
<p>This page has moved. <a href="${esc(dest)}" style="color:#F6F6F3">Continue to Ghost Town Ranch</a></p>
</body>
</html>
`;
  await mkdir('.' + from, { recursive: true });
  await writeFile('.' + from + 'index.html', html);
  n++;
}
console.log(`Wrote ${n} forwarding pages.`);
