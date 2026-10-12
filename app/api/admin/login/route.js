import { NextResponse } from 'next/server';
import { createSession, SESSION_COOKIE, sessionCookieOptions, sameOrigin } from '@/lib/auth';
import { limitRequest } from '@/lib/rate-limit';
import crypto from 'crypto';

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
  if (!sameOrigin(request)) return Response.json({ error: 'İstek kaynağı doğrulanamadı' }, { status: 403 });
  const limited = limitRequest(request, 'login', { limit: 10, windowMs: 15 * 60_000 });
  if (limited) return limited;
  try {
    const { username = '', password = '' } = await request.json();

    if (typeof username !== 'string' || typeof password !== 'string' || username.length > 255 || password.length > 1024) return Response.json({ success: false, error: 'Giriş bilgileri geçersiz' }, { status: 400 });
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

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, createSession(adminUsername), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { success: false, error: 'Giriş işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
