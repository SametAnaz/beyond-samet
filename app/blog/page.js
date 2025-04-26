import Link from 'next/link';
import { getSortedPostsData } from '@/lib/firebase-posts';
import styles from './page.module.css';

export const metadata = {
  title: 'Blog',
  description: 'Yazılım, teknoloji ve kişisel deneyimlerim hakkında blog yazılarım.'
};

export const revalidate = 3600; // Her saat verileri yeniden çek

export default async function BlogPage() {
  const allPosts = await getSortedPostsData();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.description}>
          Yazılım geliştirme, projelerim ve teknoloji hakkında yazılarım
        </p>
      </header>

      <div className={styles.blogList}>
        {allPosts.length === 0 ? (
          <p className={styles.noPosts}>Henüz blog yazısı bulunmamaktadır.</p>
        ) : (
          allPosts.map((post) => (
            <article key={post.slug} className={styles.blogItem}>
              <Link href={`/blog/${post.slug}`} className={styles.blogLink}>
                <div className={styles.blogContent}>
                  <h2 className={styles.blogTitle}>{post.title}</h2>
                  <div className={styles.blogMeta}>
                    <span className={styles.blogAuthor}>{post.author}</span>
                    <time dateTime={post.date instanceof Date ? post.date.toISOString() : new Date(post.date).toISOString()} className={styles.blogDate}>
                      {post.date instanceof Date
                        ? post.date.toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : new Date(post.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                      }
                    </time>
                  </div>
                  <p className={styles.blogExcerpt}>{post.excerpt}</p>
                  <span className={styles.readMore}>Devamını Oku</span>
                </div>
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
} 