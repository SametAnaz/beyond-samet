import { slugify } from './post-utils.js';
function text(node) { return node.type === 'text' ? node.value : (node.children || []).map(text).join(''); }
export function rehypeHeadingIds() {
  return tree => {
    const used = new Map();
    function walk(node) {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
        const base = slugify(text(node)) || 'baslik';
        const count = used.get(base) || 0; used.set(base, count + 1);
        node.properties ||= {}; node.properties.id = count ? `${base}-${count + 1}` : base;
      }
      for (const child of node.children || []) walk(child);
    }
    walk(tree);
  };
}
