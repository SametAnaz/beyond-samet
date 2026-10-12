import { getSession } from '@/lib/auth';
export async function GET(request) {
  const session = getSession(request);
  return Response.json({ authenticated: Boolean(session) }, { status: session ? 200 : 401, headers: { 'Cache-Control': 'no-store' } });
}
