import mysql from 'mysql2/promise';
import { initializeCommentsTable } from '@/lib/mysql-posts';
import { getDatabaseConfig } from '@/lib/mysql-config';

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool(getDatabaseConfig());

export async function GET(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    // Comments tablosunu başlat
    await initializeCommentsTable();
    
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
