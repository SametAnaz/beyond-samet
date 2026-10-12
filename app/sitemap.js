import { pool } from '@/lib/mysql';
import { projects } from '@/lib/projects';
import { siteUrl } from '@/lib/site';
export const dynamic = 'force-dynamic';
export default async function sitemap() {
  const [posts] = await pool.query('SELECT slug,updatedAt FROM posts WHERE published=1');
  return [...['', '/about', '/blog', '/gallery', '/contact', '/projects'].map(path => ({ url: siteUrl + path })), ...posts.map(post => ({ url: `${siteUrl}/blog/${post.slug}`, lastModified: new Date(post.updatedAt) })), ...projects.map(project => ({ url: `${siteUrl}/projects/${project.slug}` }))];
}
