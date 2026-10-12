import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, verifySession, requireAdmin, sessionCookieOptions, SESSION_SECONDS } from '../lib/auth.js';
import { normalizePost, readingMinutes, slugify } from '../lib/post-utils.js';
import { limitRequest } from '../lib/rate-limit.js';
process.env.ADMIN_SESSION_SECRET = 'test-secret-'.repeat(6);
process.env.ADMIN_USERNAME = 'test-admin';
const now = Date.now();
const token = createSession('test-admin', now);

test('imzalı oturum doğrulanır; değiştirilmiş ve süresi dolmuş oturum reddedilir', () => {
  assert.equal(verifySession(token, now).sub, 'test-admin');
  const [payload, signature] = token.split('.');
  const altered = Buffer.from(JSON.stringify({ sub: 'test-admin', exp: Math.floor(now / 1000) + 999999 })).toString('base64url');
  assert.equal(verifySession(`${altered}.${signature}`, now), null);
  assert.equal(verifySession(token, now + SESSION_SECONDS * 1000), null);
  assert.equal(verifySession(`${payload}.bozuk`), null);
  assert.equal(verifySession(createSession('baska-kullanici')), null);
});
test('localStorage benzeri istemci bilgisi yetki vermez; cross-origin yazma reddedilir', () => {
  const local = new Request('https://example.com/api/posts', { method: 'POST', headers: { 'adminAuth': '{"isAuthenticated":true}' } });
  assert.equal(requireAdmin(local).status, 401);
  const authorized = new Request(local.url, { method: 'POST', headers: { cookie: `beyond_admin_session=${token}`, origin: 'https://example.com' } });
  assert.equal(requireAdmin(authorized), null);
  const crossSite = new Request(local.url, { method: 'POST', headers: { cookie: `beyond_admin_session=${token}`, origin: 'https://other.example' } });
  assert.equal(requireAdmin(crossSite).status, 403);
  assert.equal(sessionCookieOptions().httpOnly, true);
  assert.equal(sessionCookieOptions().sameSite, 'strict');
});
test('taslak boş içerikle kaydedilir; boş içerik yayınlanamaz', () => {
  const draft = normalizePost({ title: 'İlk Taslak' });
  assert.equal(draft.published, 0); assert.equal(draft.slug, 'ilk-taslak');
  assert.throws(() => normalizePost({ title: 'İlk Taslak', published: true }));
  assert.throws(() => normalizePost({ title: 'Geçersiz', tags: 'etiket' }));
  assert.throws(() => normalizePost({ title: 'Geçersiz', published: 'false' }));
  assert.deepEqual(normalizePost({ featured: false }, { partial: true }), { featured: 0 });
});
test('Türkçe adresler ve okuma süresi hesaplanır', () => {
  assert.equal(slugify('İnekWiz: Çiftlikler Dijitalleşiyor!'), 'inekwiz-ciftlikler-dijitallesiyor');
  assert.equal(readingMinutes('kelime '.repeat(401)), 3);
  assert.equal(normalizePost({ title: 'Test', tags: ['AI', ' AI ', 'Backend'] }).tags.length, 2);
});
test('hız sınırı aşılınca 429 ve retry-after döner', () => {
  const request = new Request('https://example.com/api/contact');
  const scope = 'test-' + Date.now();
  assert.equal(limitRequest(request, scope, { limit: 1, windowMs: 10_000 }), null);
  const response = limitRequest(request, scope, { limit: 1, windowMs: 10_000 });
  assert.equal(response.status, 429); assert(Number(response.headers.get('retry-after')) > 0);
});
