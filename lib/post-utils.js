export function slugify(value = '') {
  const tr = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
  return String(value).toLocaleLowerCase('tr-TR').replace(/[çğıöşü]/g, char => tr[char]).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 255);
}
export function readingMinutes(content = '') {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));
}
export function normalizePost(input, { partial = false } = {}) {
  const out = {};
  const limits = { title: 500, author: 255, content: 500_000, excerpt: 2000, metaDescription: 500 };
  for (const [key, max] of Object.entries(limits)) {
    if (partial && input[key] === undefined) continue;
    if (input[key] !== undefined && typeof input[key] !== 'string') throw new Error(`${key} metin olmalıdır`);
    out[key] = String(input[key] ?? '').trim();
    if (out[key].length > max) throw new Error(`${key} en fazla ${max} karakter olabilir`);
  }
  if (!partial || input.title !== undefined) { if (!out.title) throw new Error('Başlık gerekli'); }
  if (input.slug !== undefined || !partial) {
    out.slug = slugify(input.slug || out.title);
    if (!out.slug) throw new Error('Geçerli bir URL adı gerekli');
  }
  for (const key of ['published', 'featured']) {
    if (input[key] !== undefined) {
      if (![true, false, 0, 1].includes(input[key])) throw new Error(`${key} geçersiz`);
      out[key] = input[key] ? 1 : 0;
    } else if (!partial) out[key] = 0;
  }
  if (input.tags !== undefined || !partial) {
    if (input.tags !== undefined && !Array.isArray(input.tags)) throw new Error('Etiketler liste olmalıdır');
    out.tags = [...new Set((input.tags || []).map(tag => String(tag).trim()).filter(Boolean))];
    if (out.tags.length > 20 || out.tags.some(tag => tag.length > 60)) throw new Error('En fazla 20 etiket, etiket başına 60 karakter kullanılabilir');
  }
  if (out.content !== undefined) out.readingTime = readingMinutes(out.content);
  if (out.published && !out.content && !partial) throw new Error('Yayınlamak için içerik gerekli');
  return out;
}
