import Link from 'next/link';
import { getPaginatedPosts } from '@/lib/firebase-posts';
import styles from '@/styles/pages/blog.module.css';
import Pagination from '@/app/components/Pagination';

export const metadata = {
  title: 'Blog',
  description: 'Yazılım, teknoloji ve kişisel deneyimlerim hakkında blog yazılarım.'
};

export const revalidate = 1800; // Her 30 dakikada verileri yeniden çek

export default async function BlogPage({ searchParams }) {
  // Sayfa numarasını URL parametrelerinden al veya varsayılan 1 kullan
  const currentPage = searchParams?.page ? parseInt(searchParams.page) : 1;
  const POSTS_PER_PAGE = 5; // Sayfa başına gösterilecek yazı sayısı
  
  // Sayfalandırılmış blog yazılarını al
  const { posts, totalPosts } = await getPaginatedPosts(currentPage, POSTS_PER_PAGE);
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.description}>
          Yazılım geliştirme, projelerim ve teknoloji hakkında yazılarım
        </p>
      </header>

      <div className={styles.blogList}>
        {posts.length === 0 ? (
          <p className={styles.noPosts}>Henüz blog yazısı bulunmamaktadır.</p>
        ) : (
          posts.map((post) => (
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
      
      {/* Sayfalandırma bileşeni - toplam yazı sayısı 0'dan büyükse göster */}
      {totalPosts > 0 && (
        <Pagination 
          totalItems={totalPosts} 
          itemsPerPage={POSTS_PER_PAGE} 
          currentPage={currentPage}
          path="/blog"
        />
      )}
    </div>
  );
} 