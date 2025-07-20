import Link from 'next/link';
import styles from '@/styles/pages/blog.module.css';
import Pagination from '@/app/components/Pagination';

export const metadata = {
  title: 'Blog',
  description: 'Yazılım, teknoloji ve kişisel deneyimlerim hakkında blog yazılarım.'
};

export const revalidate = 5; // Her 5 saniyede verileri yeniden çek

// MySQL API'den veri çek
async function getPosts(page = 1, limit = 5) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts?page=${page}&limit=${limit}&published=true`, {
      next: { revalidate: 5 } // 5 saniyede bir yenile
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], pagination: { totalPosts: 0, totalPages: 0, currentPage: 1 } };
  }
}

export default async function BlogPage({ searchParams }) {
  // Next.js 15'te searchParams'ı await etmemiz gerekiyor
  const resolvedSearchParams = await searchParams;
  
  // Sayfa numarasını URL parametrelerinden al veya varsayılan 1 kullan
  const currentPage = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page) : 1;
  const POSTS_PER_PAGE = 5; // Sayfa başına gösterilecek yazı sayısı
  
  // MySQL API'den blog yazılarını al
  const { posts, pagination } = await getPosts(currentPage, POSTS_PER_PAGE);
  
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
                    <time dateTime={new Date(post.createdAt).toISOString()} className={styles.blogDate}>
                      {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
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
      {pagination.totalPosts > 0 && (
        <Pagination 
          totalItems={pagination.totalPosts} 
          itemsPerPage={POSTS_PER_PAGE} 
          currentPage={currentPage}
          path="/blog"
        />
      )}
    </div>
  );
} 