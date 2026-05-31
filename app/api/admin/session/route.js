import { clearAdminSessionCookie, getAdminSession, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request) {
  const session = getAdminSession(request);

  if (!session) {
    return unauthorizedResponse();
  }

  return Response.json({ success: true, user: { username: session.sub } });
}

export async function DELETE() {
  const response = Response.json({ success: true });
  return clearAdminSessionCookie(response);
}
