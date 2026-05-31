import mysql from 'mysql2/promise';
import { initializeCommentsTable } from '@/lib/mysql-posts';
import { getDatabaseConfig } from '@/lib/mysql-config';

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool(getDatabaseConfig());

export async function GET(request) {
  try {
    // Comments tablosunu başlat
    await initializeCommentsTable();
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return Response.json({ error: 'Slug parametresi gerekli' }, { status: 400 });
    }

    // Sadece approved (approved = 1) yorumları getir, tarihe göre sırala (yeniden eskiye)
    const [comments] = await pool.execute(
      'SELECT id, name, content as comment, createdAt as created_at FROM comments WHERE slug = ? AND approved = 1 ORDER BY createdAt DESC',
      [slug]
    );

    return Response.json({
      success: true,
      comments: comments
    });

  } catch (error) {
    console.error('Comments fetch error:', error);
    return Response.json({ error: 'Yorumlar getirilemedi' }, { status: 500 });
  }
}
