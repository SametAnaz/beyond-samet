import { getAllPosts } from '@/lib/mysql-posts';
import Link from 'next/link';
import styles from '../../styles/pages/blog.module.css';
import Pagination from '../components/Pagination';

export const metadata = {
  title: 'Blog',
  description: 'Yazılım geliştirme, projelerim ve teknoloji hakkında yazılarım',
};

export const revalidate = 300; // Her 5 dakikada verileri yeniden çek

// MySQL'den direkt veri çek
async function getPosts(page = 1, limit = 5) {
  try {
    const result = await getAllPosts();
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Sadece yayınlanmış postları filtrele
    const publishedPosts = result.posts.filter(post => post.published === 1);
    
    // Sayfalama hesapla
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const posts = publishedPosts.slice(startIndex, endIndex);
    
    return {
      posts,
      totalPosts: publishedPosts.length,
      currentPage: page,
      totalPages: Math.ceil(publishedPosts.length / limit)
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], totalPosts: 0, currentPage: 1, totalPages: 1 };
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