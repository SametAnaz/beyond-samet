import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transform } from 'next/dist/build/swc/index.js';
fs.mkdirSync('.next', { recursive: true });
const dir = fs.mkdtempSync(path.resolve('.next/markdown-tests-'));
for (const name of ['OptimizedImage', 'CodeBlock', 'CustomMarkdown']) {
  let source = fs.readFileSync(`components/${name}.js`, 'utf8');
  source = source.replace(/import styles from '[^']+';/, 'const styles = new Proxy({}, { get: (_, key) => key });').replace(/import 'highlight\.js[^']+';/, '').replace("from './OptimizedImage'", "from './OptimizedImage.mjs'").replace("from './CodeBlock'", "from './CodeBlock.mjs'").replace("from '@/lib/markdown-headings'", `from '${pathToFileURL(path.resolve('lib/markdown-headings.js'))}'`).replace("import Image from 'next/image';", "import ImageModule from 'next/image.js'; const Image = ImageModule.default || ImageModule;").replace("import Link from 'next/link';", "import LinkModule from 'next/link.js'; const Link = LinkModule.default || LinkModule;");
  const result = await transform(source, { filename: `${name}.jsx`, jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } }, module: { type: 'es6' } });
  fs.writeFileSync(path.join(dir, `${name}.mjs`), result.code);
}
const { default: Markdown } = await import(pathToFileURL(path.join(dir, 'CustomMarkdown.mjs')));
after(() => fs.rmSync(dir, { recursive: true, force: true }));
for (const [name, content] of [
  ['inline image', 'Önce ![Görsel](/example.png "caption=Deneme") sonra'],
  ['emphasized image', 'Önce **![Görsel](/example.png)** sonra'],
  ['linked image', 'Önce [![Görsel](/example.png)](https://example.com) sonra'],
  ['standalone image', '![Görsel](/example.png "caption=Deneme")'],
  ['inline code', 'Önce `const x = 1` sonra'],
  ['fenced code', '```js\nconst x = 1;\n```'],
  ['unlabeled code', '```\nconst x = 1;\n```'],
]) {
  test(`Markdown: ${name} geçerli HTML üretir`, () => {
    const html = renderToStaticMarkup(React.createElement(Markdown, { content }));
    const stack = [];
    for (const token of html.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/g)) {
      const tag = token[1];
      if (token[0].startsWith('</')) { stack.splice(stack.lastIndexOf(tag)); continue; }
      if (['div', 'figure', 'pre', 'p'].includes(tag)) assert(!stack.some(t => ['p', 'em', 'strong', 'code'].includes(t)), `${tag} yanlış yerleşti`);
      if (tag === 'pre') assert(!stack.includes('pre'));
      if (!['img', 'link', 'br', 'hr', 'input', 'meta'].includes(tag)) stack.push(tag);
    }
    if (name === 'inline code') { assert(html.includes('class="inlineCode"')); assert(!html.includes('<pre')); }
    if (name.includes('code') && name !== 'inline code') { assert.equal((html.match(/<pre\b/g) || []).length, 1); assert(html.includes('Kopyala')); }
  });
}
test('içindekiler bağlantıları için aynı başlıklar benzersiz ID alır', () => {
  const html = renderToStaticMarkup(React.createElement(Markdown, { content: '## Giriş\n\n## Giriş' }));
  assert(html.includes('id="giris"')); assert(html.includes('id="giris-2"'));
});
