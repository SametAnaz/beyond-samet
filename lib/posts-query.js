import { cache } from 'react';
import { pool } from './mysql.js';

export function decodePost(row) {
  return row ? { ...row, tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [] } : null;
}
export async function listPosts({ page = 1, limit = 10, query = '', tag = '', admin = false, published } = {}) {
  page = Math.min(100_000, Math.max(1, Number.parseInt(page, 10) || 1));
  limit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  const where = []; const values = [];
  if (!admin) where.push('published = 1');
  else if (published !== undefined) { where.push('published = ?'); values.push(published ? 1 : 0); }
  if (query) { where.push('(title LIKE ? OR excerpt LIKE ?)'); values.push(`%${query.slice(0, 200)}%`, `%${query.slice(0, 200)}%`); }
  if (tag) { where.push('JSON_CONTAINS(tags, ?)'); values.push(JSON.stringify(tag.slice(0, 60))); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [[count]] = await pool.query(`SELECT COUNT(*) AS total FROM posts ${clause}`, values);
  const totalPages = Math.max(1, Math.ceil(count.total / limit));
  page = Math.min(page, totalPages);
  const columns = admin ? '*' : 'id, title, excerpt, slug, author, tags, readingTime, featured, createdAt, updatedAt';
  const [rows] = await pool.query(`SELECT ${columns} FROM posts ${clause} ORDER BY createdAt DESC, id DESC LIMIT ? OFFSET ?`, [...values, limit, (page - 1) * limit]);
  return { posts: rows.map(decodePost), pagination: { currentPage: page, totalPages, totalPosts: count.total, hasNext: page < totalPages, hasPrevious: page > 1 } };
}
export const getPublishedPost = cache(async slug => {
  const [rows] = await pool.execute('SELECT * FROM posts WHERE slug = ? AND published = 1 LIMIT 1', [slug]);
  return decodePost(rows[0]);
});
export async function getPostById(id) {
  const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ? LIMIT 1', [id]);
  return decodePost(rows[0]);
}
export async function getPublishedTags() {
  const [rows] = await pool.query('SELECT tags FROM posts WHERE published = 1 AND tags IS NOT NULL');
  return [...new Set(rows.flatMap(row => decodePost(row).tags))].sort((a, b) => a.localeCompare(b, 'tr'));
}
export async function relatedPosts(post) {
  const tags = post.tags || [];
  const clause = tags.length ? `AND (${tags.map(() => 'JSON_CONTAINS(tags, ?)').join(' OR ')})` : '';
  const query = `SELECT title, slug, excerpt FROM posts WHERE published = 1 AND id <> ? ${clause} ORDER BY createdAt DESC LIMIT 3`;
  const [rows] = await pool.query(query, [post.id, ...tags.map(tag => JSON.stringify(tag))]);
  if (rows.length || !tags.length) return rows;
  const [fallback] = await pool.query('SELECT title, slug, excerpt FROM posts WHERE published = 1 AND id <> ? ORDER BY createdAt DESC LIMIT 3', [post.id]);
  return fallback;
}
