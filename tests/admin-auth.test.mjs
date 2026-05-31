import test from 'node:test';
import assert from 'node:assert/strict';

process.env.ADMIN_SESSION_SECRET = 'test-secret-with-at-least-32-characters';

const {
  createAdminSessionToken,
  verifyAdminSessionToken,
  requireAdminAuth,
  ADMIN_SESSION_COOKIE,
} = await import('../lib/admin-auth.js');

test('admin session token verifies when signed and rejects tampering', async () => {
  const token = createAdminSessionToken('admin');

  assert.equal(verifyAdminSessionToken(token).valid, true);
  assert.equal(verifyAdminSessionToken(`${token}tampered`).valid, false);
});

test('requireAdminAuth returns 401 without a valid httpOnly cookie', async () => {
  const request = new Request('https://example.com/api/posts', { method: 'POST' });
  const response = requireAdminAuth(request);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Yetkisiz erişim',
  });
});

test('requireAdminAuth allows requests with a valid admin cookie', () => {
  const token = createAdminSessionToken('admin');
  const request = new Request('https://example.com/api/posts', {
    method: 'POST',
    headers: {
      cookie: `${ADMIN_SESSION_COOKIE}=${token}`,
    },
  });

  assert.equal(requireAdminAuth(request), null);
});
