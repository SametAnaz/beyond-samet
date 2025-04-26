import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/posts';
import styles from '../styles/pages/home.module.css';

export const metadata = {
  title: 'Ana Sayfa',
};

export default function Home() {
  const posts = getSortedPostsData().slice(0, 3);

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
          {posts.map((post) => (
            <article key={post.slug} className={styles.blogCard}>
              <Link href={`/blog/${post.slug}`} className={styles.blogLink}>
                <h3 className={styles.blogTitle}>{post.title}</h3>
                <p className={styles.blogMeta}>
                  <span className={styles.authorName}>{post.author}</span>
                  <span className={styles.blogDate}>
                    {new Date(post.date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
                <p className={styles.blogExcerpt}>{post.excerpt}</p>
                <span className={styles.readMore}>Devamını Oku</span>
              </Link>
            </article>
          ))}
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