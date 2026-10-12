import { requireAdmin } from '@/lib/auth';

// MySQL bağlantı havuzu oluştur
import { pool } from '@/lib/mysql';

export async function GET(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    // Comments tablosunu başlat
    
    // Tüm yorumları getir (admin için tüm yorumlar görünür)
    const [comments] = await pool.execute(
      `SELECT id, name, email, content, slug, approved, createdAt, ipAddress, userAgent 
       FROM comments 
       ORDER BY createdAt DESC`
    );

    return Response.json({
      success: true,
      comments: comments
    });

  } catch (error) {
    console.error('Admin comments fetch error:', error);
    return Response.json({ error: 'Yorumlar getirilemedi' }, { status: 500 });
  }
}
