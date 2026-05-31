import crypto from 'crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET environment variable must be at least 32 characters');
  }

  return secret;
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left || '', 'utf8');
  const rightBuffer = Buffer.from(right || '', 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminSessionToken(username) {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({
    sub: username,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }));
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) {
    return { valid: false };
  }

  const expectedSignature = sign(payload);
  if (!safeCompare(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (!session.exp || session.exp < now) {
      return { valid: false };
    }

    return { valid: true, session };
  } catch {
    return { valid: false };
  }
}

function parseCookie(header) {
  return Object.fromEntries(
    (header || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=');
        if (separatorIndex === -1) {
          return [part, ''];
        }
        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
      })
  );
}

export function getAdminSession(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookie(cookieHeader);
  const token = cookies[ADMIN_SESSION_COOKIE];
  const verification = verifyAdminSessionToken(token);

  return verification.valid ? verification.session : null;
}

export function unauthorizedResponse() {
  return Response.json(
    { success: false, error: 'Yetkisiz erişim' },
    { status: 401 }
  );
}

export function requireAdminAuth(request) {
  return getAdminSession(request) ? null : unauthorizedResponse();
}

export function setAdminSessionCookie(response, username) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(username),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}

export function clearAdminSessionCookie(response) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return response;
}
