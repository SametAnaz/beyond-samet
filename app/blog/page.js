import { listPosts, getPublishedTags } from '@/lib/posts-query';
import Link from 'next/link';
import styles from '@/styles/pages/blog.module.css';
import Pagination from '../components/Pagination';
export const metadata = { title: 'Blog', description: 'Yazılım geliştirme, projelerim ve teknoloji hakkında yazılarım', alternates: { canonical: '/blog' } };
export const dynamic = 'force-dynamic';
export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === 'string' ? params.q.slice(0, 200) : '';
  const tag = typeof params?.tag === 'string' ? params.tag.slice(0, 60) : '';
  const [{ posts, pagination }, tags] = await Promise.all([listPosts({ page: params?.page, limit: 5, query, tag }), getPublishedTags()]);
  return <div className={styles.container}>
    <header className={styles.header}><p className={styles.kicker}>Beyond Samet</p><h1 className={styles.title}>Blog</h1><p className={styles.description}>Yazılım geliştirme, projelerim ve teknoloji hakkında yazılarım</p><div className={styles.headerMeta}><span className={styles.metaPill}>{pagination.totalPosts} yazı</span><span className={styles.metaPill}>{pagination.currentPage}/{pagination.totalPages} sayfa</span></div></header>
    <form action="/blog" className={styles.searchForm} role="search"><div><label htmlFor="blog-query">Yazılarda ara</label><input type="search" id="blog-query" name="q" defaultValue={query} placeholder="Başlık veya konu…" maxLength={200} /></div><div><label htmlFor="blog-tag">Etiket</label><select id="blog-tag" name="tag" defaultValue={tag}><option value="">Tüm etiketler</option>{tags.map(value => <option key={value} value={value}>{value}</option>)}</select></div><button type="submit">Ara</button>{(query || tag) && <Link href="/blog">Filtreleri temizle</Link>}</form>
    <div className={styles.blogList}>{posts.length ? posts.map(post => <article key={post.id} className={`${styles.blogItem} ${post.featured ? styles.featured : ''}`}><Link href={`/blog/${post.slug}`} className={styles.blogLink}><div className={styles.blogContent}>{Boolean(post.featured) && <span className={styles.featuredBadge}>Öne Çıkan</span>}<h2 className={styles.blogTitle}>{post.title}</h2><div className={styles.blogMeta}><span className={styles.blogAuthor}>{post.author}</span><time dateTime={new Date(post.createdAt).toISOString()} className={styles.blogDate}>{new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>{post.readingTime > 0 && <span>{post.readingTime} dk okuma</span>}</div><p className={styles.blogExcerpt}>{post.excerpt}</p><span className={styles.readMore}>Devamını Oku →</span></div></Link>{post.tags.length > 0 && <div className={styles.tagLinks}>{post.tags.map(value => <Link key={value} href={`/blog?tag=${encodeURIComponent(value)}`}>{value}</Link>)}</div>}</article>) : <div className={styles.noPosts}><h2>{query || tag ? 'Aramanıza uygun yazı bulunamadı' : 'Henüz yayınlanan yazı yok'}</h2><p>{query || tag ? 'Başka bir kelime veya etiket deneyebilirsiniz.' : 'Yeni içerikler burada paylaşılacak.'}</p></div>}</div>
    {pagination.totalPosts > 0 && <div className={styles.paginationWrap}><Pagination totalItems={pagination.totalPosts} itemsPerPage={5} currentPage={pagination.currentPage} path="/blog" /></div>}
  </div>;
}
