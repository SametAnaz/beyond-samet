import dotenv from 'dotenv';
import sharp from 'sharp';
dotenv.config({ quiet: true });
const { pool } = await import('../lib/mysql.js');
try {
  for (const table of ['gallery_images', 'blog_images']) {
    const [rows] = await pool.query(`SELECT id,url FROM \`${table}\` WHERE width IS NULL OR height IS NULL`);
    let updated = 0;
    for (const row of rows) {
      try {
        const url = new URL(row.url);
        if (url.protocol !== 'https:' || !url.hostname.endsWith('.public.blob.vercel-storage.com')) continue;
        const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error('Görsel alınamadı');
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length > 10 * 1024 * 1024) throw new Error('Görsel çok büyük');
        const { width, height, orientation } = await sharp(bytes).metadata();
        if (width && height) {
          const rotated = orientation >= 5 && orientation <= 8;
          await pool.execute(`UPDATE \`${table}\` SET width=?,height=?,updatedAt=updatedAt WHERE id=?`, [rotated ? height : width, rotated ? width : height, row.id]);
          updated++;
        }
      } catch { console.log(`${table}: bir görselin boyutu okunamadı`); }
    }
    console.log(`${table}: ${updated}/${rows.length} görsel boyutu kaydedildi.`);
  }
} finally { await pool.end(); }
