import crypto from 'node:crypto';
import { addComment } from '@/lib/mysql-posts';
import { getPublishedPost } from '@/lib/posts-query';
import { limitRequest } from '@/lib/rate-limit';
export async function POST(request) {
  const limited = limitRequest(request, 'comment'); if (limited) return limited;
  try {
    const input = await request.json();
    for (const [key, max] of Object.entries({ name: 100, content: 5000, slug: 255 })) {
      if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > max) return Response.json({ error: 'İsim, yorum ve yazı adresini kontrol edin' }, { status: 400 });
    }
    if (input.email && (typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))) return Response.json({ error: 'E-posta adresi geçersiz' }, { status: 400 });
    if (!await getPublishedPost(input.slug)) return Response.json({ error: 'Yazı bulunamadı' }, { status: 404 });
    const comment = { id: crypto.randomUUID(), name: input.name.trim(), content: input.content.trim(), email: input.email?.trim() || null, slug: input.slug, approved: 0 };
    const result = await addComment(comment);
    if (!result.success) return Response.json({ error: 'Yorum kaydedilemedi' }, { status: 503 });
    return Response.json({ success: true, id: comment.id, message: 'Yorumunuz onay bekliyor' }, { status: 201 });
  } catch (error) { console.error('Yorum kaydedilemedi:', error.name); return Response.json({ error: 'Yorum kaydedilemedi' }, { status: 500 }); }
}
