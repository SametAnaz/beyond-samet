import { config } from 'dotenv';
import { pool } from '../lib/mysql-posts.js';

config({ path: '.env.local' });

async function updateInekwizSlug() {
  try {
    const connection = await pool.getConnection();
    
    // İnekwiz post'unun slug'ını güncelle
    const [result] = await connection.execute(
      'UPDATE posts SET slug = ? WHERE id = ?',
      ['inekwiz-ile-ciftlikler-dijitallesiyor', 'inekwiz']
    );
    
    connection.release();
    
    if (result.affectedRows > 0) {
      console.log('✅ İnekwiz post slug\'ı güncellendi');
    } else {
      console.log('❌ İnekwiz post bulunamadı');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

updateInekwizSlug();
