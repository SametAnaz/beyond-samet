import mysql from 'mysql2/promise';
import { initializeCommentsTable } from '@/lib/mysql-posts';

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool({
  host: '95.70.204.147',
  port: 3306,
  user: 'root',
  password: 'bMYDUJx6usmjOFiV36HqUUD8i40SiuM',
  database: 'beyond_samet_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export async function GET(request) {
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
