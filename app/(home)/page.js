'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../../styles/pages/home.module.css';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hoveredPost, setHoveredPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // MySQL API'sinden blog yazılarını al
        const response = await fetch('/api/posts?limit=3');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []); // posts array'ini çıkar
        } else {
          console.error("Blog yazıları yüklenirken hata:", response.statusText);
          setPosts([]); // Hata durumunda boş array
        }
      } catch (error) {
        console.error("Blog yazıları yüklenirken hata:", error);
        setPosts([]); // Hata durumunda boş array
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

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
              Bilgisayar Mühendisliği öğrencisiyim. Web geliştirme, yazılım mühendisliği 
              ve teknoloji konularında çalısıyorum ve blog yazıları yazıyorum.
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
            Recep Tayyip Erdoğan Üniversitesi'nde Bilgisayar Mühendisliği eğitimi alıyorum.
            Web geliştirme, yazılım mühendisliği ve yapay zeka konularında kendimi geliştiriyorum.
          </p>
          <Link href="/about" className={styles.aboutLink}>
            Daha Fazla Bilgi
          </Link>
        </div>
      </section>
    </div>
  );
}
