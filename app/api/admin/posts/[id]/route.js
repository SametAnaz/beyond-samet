import { requireAdmin } from '@/lib/auth';
import { getPostById } from '@/lib/posts-query';
export async function GET(request, { params }) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    const { id } = await params;
    const post = await getPostById(id);
    return post ? Response.json({ post }, { headers: { 'Cache-Control': 'no-store' } }) : Response.json({ error: 'Yazı bulunamadı' }, { status: 404 });
  } catch (error) { console.error('Yazı yüklenemedi', error); return Response.json({ error: 'Yazı yüklenemedi' }, { status: 503 }); }
}
