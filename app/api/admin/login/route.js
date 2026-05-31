import crypto from 'crypto';
import { setAdminSessionCookie } from '@/lib/admin-auth';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

function safeCompare(input, expected) {
  const inputBuffer = Buffer.from(input || '', 'utf8');
  const expectedBuffer = Buffer.from(expected || '', 'utf8');

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, {
      keyPrefix: 'admin-login',
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    const { username = '', password = '' } = await request.json();

    const adminUsername = getRequiredEnv('ADMIN_USERNAME');
    const adminPassword = getRequiredEnv('ADMIN_PASSWORD');

    const isValidUsername = safeCompare(username, adminUsername);
    const isValidPassword = safeCompare(password, adminPassword);

    if (!isValidUsername || !isValidPassword) {
      return Response.json(
        { success: false, error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    const response = Response.json({ success: true });
    return setAdminSessionCookie(response, adminUsername);
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { success: false, error: 'Giriş işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
