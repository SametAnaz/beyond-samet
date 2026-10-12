import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedPost, relatedPosts } from '@/lib/posts-query';
import { pool } from '@/lib/mysql';
import { readingMinutes } from '@/lib/post-utils';
import { siteUrl } from '@/lib/site';
import styles from '@/styles/blog/post.module.css';
import CommentSection from '../components/CommentSection';
import PostContent from '../components/PostContent';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const description = post.metaDescription || post.excerpt;
  return { title: post.title, description, alternates: { canonical: `/blog/${slug}` }, openGraph: { title: post.title, description, type: 'article', url: `${siteUrl}/blog/${slug}`, authors: [post.author], publishedTime: new Date(post.createdAt).toISOString(), modifiedTime: new Date(post.updatedAt).toISOString() }, twitter: { card: 'summary_large_image', title: post.title, description } };
}
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const [related, [comments]] = await Promise.all([relatedPosts(post), pool.execute('SELECT id, name, content AS comment, createdAt AS created_at FROM comments WHERE slug=? AND approved=1 ORDER BY createdAt DESC', [slug])]);
  const structured = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.metaDescription || post.excerpt, datePublished: new Date(post.createdAt).toISOString(), dateModified: new Date(post.updatedAt).toISOString(), author: { '@type': 'Person', name: post.author }, mainEntityOfPage: `${siteUrl}/blog/${slug}`, image: `${siteUrl}/blog/${slug}/opengraph-image` };
  return <div className={styles.container}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    <article className={styles.article}><header className={styles.header}><h1 className={styles.title}>{post.title}</h1><div className={styles.meta}><span className={styles.author}>{post.author}</span><time dateTime={new Date(post.createdAt).toISOString()} className={styles.date}>{new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</time><span>{post.readingTime || readingMinutes(post.content)} dk okuma</span></div>{post.tags.length > 0 && <p>{post.tags.map(tag => <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} style={{ marginRight: '1rem' }}>{tag}</Link>)}</p>}</header><PostContent post={{ content: post.content }} /></article>
    {related.length > 0 && <aside className={styles.relatedPosts}><h2>İlgili yazılar</h2>{related.map(item => <Link key={item.slug} href={`/blog/${item.slug}`}>{item.title} →</Link>)}</aside>}
    <CommentSection slug={slug} initialComments={JSON.parse(JSON.stringify(comments))} />
  </div>;
}
