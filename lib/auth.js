import crypto from 'node:crypto';

export const SESSION_COOKIE = 'beyond_admin_session';
export const SESSION_SECONDS = 24 * 60 * 60;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('ADMIN_SESSION_SECRET en az 32 karakter olmalıdır');
  return value;
}

export function createSession(username, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: username, exp: Math.floor(now / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${crypto.createHmac('sha256', secret()).update(payload).digest('base64url')}`;
}

export function verifySession(token, now = Date.now()) {
  if (!token || token.length > 2048) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expected = crypto.createHmac('sha256', secret()).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.sub !== process.env.ADMIN_USERNAME || !Number.isFinite(session.exp) || session.exp <= Math.floor(now / 1000)) return null;
    return session;
  } catch { return null; }
}

export function getSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const raw = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${SESSION_COOKIE}=`));
  if (!raw) return null;
  try { return verifySession(decodeURIComponent(raw.slice(SESSION_COOKIE.length + 1))); } catch { return null; }
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  return !origin || origin === new URL(request.url).origin;
}

export function requireAdmin(request) {
  if (!getSession(request)) return Response.json({ success: false, error: 'Oturum açmanız gerekiyor' }, { status: 401 });
  if (!['GET', 'HEAD'].includes(request.method) && !sameOrigin(request)) {
    return Response.json({ success: false, error: 'İstek kaynağı doğrulanamadı' }, { status: 403 });
  }
  return null;
}

export function sessionCookieOptions(maxAge = SESSION_SECONDS) {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge };
}
