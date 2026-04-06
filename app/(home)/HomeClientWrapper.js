'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../../styles/pages/home.module.css';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function HomeClientWrapper({ posts }) {
  const [hoveredPost, setHoveredPost] = useState(null);

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
              Yazılım ve donanım alanında projeler geliştiriyor ve kendimi sürekli geliştiriyorum. Burada projelerimi ve blog yazılarımı paylaşıyorum.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/about" className={`${styles.button} ${styles.primary}`}>
                Hakkımda
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Son Blog Yazıları */}
      <section className={styles.blogSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Son Blog Yazıları</h2>
          <Link href="/blog" className={styles.viewAll}>
            Tümünü Gör
          </Link>
        </div>
        
        <div className={styles.blogGrid}>
          {posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.article
                key={post.slug}
                className={styles.blogCard}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
              </motion.article>
            ))
          ) : (
            <div className={styles.noPosts}>
              <p>Henüz blog yazısı bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </section>

      {/* Hakkımda Preview */}
      <section className={styles.aboutPreview}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2 className={styles.aboutTitle}>Hakkımda</h2>
            <p className={styles.aboutDescription}>
              Backend ve AI odaklı sistemler geliştiren bir bilgisayar mühendisliği öğrencisiyim.
              Ölçeklenebilir web uygulamaları, otomasyon sistemleri, veri odaklı çözümler,
              sunucu kurulumu ve yönetimi üzerine çalışıyorum. Ayrıca DevOps alanına ilgi duyuyor,
              sistemlerin geliştirme ve operasyon süreçlerini birlikte ele almayı seviyorum.
            </p>
            <Link href="/about" className={`${styles.button} ${styles.secondary}`}>
              Daha Fazla Bilgi
            </Link>
          </div>
          
          <div className={styles.aboutImage}>
            <Image
              src="/assets/images/me6.png"
              alt="Samet Anaz"
              width={400}
              height={400}
              className={styles.profileImage}
              priority
            />
          </div>
        </div>
      </section>
    </div>
  );
}
