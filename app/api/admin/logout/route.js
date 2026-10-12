import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions, sameOrigin } from '@/lib/auth';
export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: 'İstek kaynağı doğrulanamadı' }, { status: 403 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0));
  return response;
}
