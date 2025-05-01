'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/firebase-posts';
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
        const postsData = await getSortedPostsData();
        setPosts(postsData.slice(0, 3)); // İlk 3 yazıyı al
      } catch (error) {
        console.error("Blog yazıları yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Eğer sayfa tamamen unmount olduğunda, herhangi bir state güncellemesi
  // yapılmasını engellemek için cleanup function
  useEffect(() => {
    return () => {
      setHoveredPost(null);
      setPosts([]);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Bölümü */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Samet Anaz</h1>
          <p className={styles.subtitle}>
            Bilgisayar Mühendisliği Öğrencisi & Yazılım Geliştirici
          </p>
          <div className={styles.socialLinks}>
            <a
              href="https://github.com/SametAnaz"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub Profile"
            >
              <Image
                src="/assets/images/github-mark.png"
                alt="GitHub"
                width={20}
                height={20}
                className={styles.socialIcon}
              />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/samet-anaz-995349291/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="LinkedIn Profile"
            >
              <Image
                src="/assets/images/linkedin-logo.png"
                alt="LinkedIn"
                width={20}
                height={20}
                className={styles.socialIcon}
              />
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Blog Yazıları Bölümü */}
      <section className={styles.blogSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Son Yazılarım</h2>
          <Link href="/blog" className={styles.viewAll}>
            Tüm Yazılar
          </Link>
        </div>

        <div className={styles.blogGrid}>
          {loading ? (
            <div className={styles.loading}>Yazılar yükleniyor...</div>
          ) : posts.length === 0 ? (
            <div className={styles.noPost}>Henüz yazı bulunmuyor.</div>
          ) : (
            posts.map((post, index) => (
              <motion.article 
                key={`post-${post.slug}-${index}`} 
                className={styles.blogCard}
                initial={{ scale: 1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 } 
                }}
                onHoverStart={() => setHoveredPost(post.slug)}
                onHoverEnd={() => setHoveredPost(null)}
              >
                <Link href={`/blog/${post.slug}`} className={styles.blogLink}>
                  <h3 className={styles.blogTitle}>{post.title}</h3>
                  <p className={styles.blogMeta}>
                    <span className={styles.authorName}>{post.author}</span>
                    <span className={styles.blogDate}>
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
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className={styles.previewContent}>
                      <div className={styles.previewHeader}>
                        <h4>{post.title}</h4>
                        <span className={styles.previewDate}>
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
                        </span>
                      </div>
                      <div className={styles.previewDivider}></div>
                      <p className={styles.previewExcerpt}>{post.excerpt}</p>
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