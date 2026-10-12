import { getPublishedPost } from '@/lib/posts-query';
import { pool } from '@/lib/mysql';
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const post = await getPublishedPost(slug);
    if (!post) return Response.json({ error: 'Blog yazısı bulunamadı' }, { status: 404 });
    const [comments] = await pool.execute('SELECT id, name, content, createdAt, parentId FROM comments WHERE slug = ? AND approved = 1 ORDER BY createdAt', [slug]);
    return Response.json({ post, comments });
  } catch (error) { console.error('Yazı yüklenemedi', error); return Response.json({ error: 'Yazı yüklenemedi' }, { status: 503 }); }
}
