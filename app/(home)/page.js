import { getAllPosts } from '@/lib/mysql-posts';
import HomeClientWrapper from './HomeClientWrapper';

export const revalidate = 300; // Her 5 dakikada verileri yeniden çek

async function getLatestPosts() {
  try {
    const result = await getAllPosts();
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Son 3 yayınlanmış postu al
    const publishedPosts = result.posts
      .filter(post => post.published === 1)
      .slice(0, 3);
      
    return publishedPosts;
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getLatestPosts();

  return <HomeClientWrapper posts={posts} />;

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Merhaba, Ben <span className={styles.accent}>Samet</span>
            </h1>
            <p className={styles.heroDescription}>
              Backend ve AI odaklı sistemler geliştiren bir bilgisayar mühendisliği öğrencisiyim. Ölçeklenebilir web uygulamaları, otomasyon sistemleri, veri odaklı çözümler, sunucu kurulumu ve yönetimi üzerine çalışıyorum. Ayrıca DevOps alanına ilgi duyuyor, sistemlerin geliştirme ve operasyon süreçlerini birlikte ele almayı seviyorum.
            </p>
            <div className={styles.heroButtons}>
              <p>
              <Link href="/about" className={styles.primaryBtn}>
                Hakkımda
              </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Blog Yazıları Bölümü */}
      <section className={styles.blogSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Son Blog Yazıları</h2>
          <Link href="/blog" className={styles.viewAllLink}>
            Tümünü Gör
          </Link>
        </div>
        
        <div className={styles.blogGrid}>
          {loading ? (
            <p className={styles.loading}>Blog yazıları yükleniyor...</p>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <motion.article 
                key={post.slug} 
                className={styles.blogCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -5 }}
                onMouseEnter={() => setHoveredPost(post.slug)}
                onMouseLeave={() => setHoveredPost(null)}
              >
                <Link href={`/blog/${post.slug}`} className={styles.blogLink}>
                  <h3 className={styles.blogTitle}>{post.title}</h3>
                  <p className={styles.blogMeta}>
                    <span className={styles.authorName}>{post.author}</span>
                    <span className={styles.blogDate}>
                      {post.createdAt 
                        ? new Date(post.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Tarih bilinmiyor'
                      }
                    </span>
                  </p>
                  <p className={styles.blogExcerpt}>{post.excerpt}</p>
                  <span className={styles.readMore}>Devamını Oku</span>
                </Link>
                
                {hoveredPost === post.slug && (
                  <motion.div 
                    key={`preview-${post.slug}`}
                    className={styles.previewPopup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.2 }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: 20,
                      transition: { duration: 0.15 }
                    }}
                  >
                    <div className={styles.previewContent}>
                      <h4 className={styles.previewTitle}>{post.title}</h4>
                      <p className={styles.previewText}>
                        {post.excerpt || 'Bu yazıda ilginç konuları ele alıyoruz...'}
                      </p>
                      <div className={styles.previewFooter}>
                        <span className={styles.previewAuthor}>
                          <span className={styles.previewIcon}>✍️</span> {post.author}
                        </span>
                        <span className={styles.previewReadMore}>Devamını oku →</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.article>
            ))
          ) : (
            <p className={styles.noPosts}>Henüz blog yazısı yok.</p>
          )}
        </div>
      </section>

      {/* Hakkımda Özet Bölümü */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <h2 className={styles.sectionTitle}>Hakkımda</h2>
          <p>
            Backend ve AI odaklı sistemler geliştiren bir bilgisayar mühendisliği öğrencisiyim. Ölçeklenebilir web uygulamaları, otomasyon sistemleri, veri odaklı çözümler, sunucu kurulumu ve yönetimi üzerine çalışıyorum. Ayrıca DevOps alanına ilgi duyuyor, sistemlerin geliştirme ve operasyon süreçlerini birlikte ele almayı seviyorum.
          </p>
          <Link href="/about" className={styles.aboutLink}>
            Daha Fazla Bilgi
          </Link>
        </div>
      </section>
    </div>
  );
}
