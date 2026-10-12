import crypto from 'node:crypto';

// Tek Node süreci için sınırlama. Birden fazla instance için ortak bir store gerekir.
const buckets = globalThis.__beyondRateBuckets ??= new Map();
export function limitRequest(request, scope, { limit = 5, windowMs = 600_000 } = {}) {
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  const key = `${scope}:${crypto.createHash('sha256').update(address).digest('hex')}`;
  const now = Date.now();
  for (const [id, bucket] of buckets) if (bucket.reset <= now) buckets.delete(id);
  if (!buckets.has(key)) {
    if (buckets.size >= 10_000) return Response.json({ error: 'Lütfen daha sonra tekrar deneyin' }, { status: 429 });
    buckets.set(key, { count: 0, reset: now + windowMs });
  }
  const bucket = buckets.get(key);
  if (++bucket.count > limit) return Response.json({ success: false, error: 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.', message: 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((bucket.reset - now) / 1000)) } });
  return null;
}
