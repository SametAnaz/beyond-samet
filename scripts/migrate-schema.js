import dotenv from 'dotenv';
import { readingMinutes } from '../lib/post-utils.js';
dotenv.config({ quiet: true });
const { pool } = await import('../lib/mysql.js');
const { initializePostsTable, initializeCommentsTable, initializeBlogImagesTable } = await import('../lib/mysql-posts.js');
const { initializeGalleryTable } = await import('../lib/mysql-gallery.js');
try {
  for (const initialize of [initializePostsTable, initializeCommentsTable, initializeBlogImagesTable, initializeGalleryTable]) {
    const result = await initialize(); if (!result.success) throw new Error(result.error);
  }
  for (const table of ['gallery_images', 'blog_images']) {
    const [columns] = await pool.query('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?', [table]);
    const existing = new Set(columns.map(column => column.COLUMN_NAME));
    for (const column of ['width', 'height']) if (!existing.has(column)) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` INT UNSIGNED NULL`);
  }
  const [posts] = await pool.query('SELECT id,content FROM posts WHERE readingTime IS NULL OR readingTime = 0');
  for (const post of posts) await pool.execute('UPDATE posts SET readingTime=?,updatedAt=updatedAt WHERE id=?', [readingMinutes(post.content), post.id]);
  console.log(`Şema hazır; içerikler korundu. ${posts.length} yazının eksik okuma süresi hesaplandı.`);
} finally { await pool.end(); }
