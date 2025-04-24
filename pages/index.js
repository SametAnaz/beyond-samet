// pages/index.js
import React from "react";
import Link from "next/link";
import styles from "../styles/home.module.css";

export default function Home() {
  return (
    <>
      {/* Hero Bölümü */}
      <section className={styles.hero}>
        <h1>Samet Anaz</h1>
        <div className={styles.socialLinks}>
          <Link href="/test">Twitter</Link>
          <Link href="/test">LinkedIn</Link>
        </div>
      </section>

      {/* Blog Giriş Bölümü */}
      <section className={`${styles.blogIntro} ${styles.container}`}>
        <h2>Bloglarım</h2>
        <article className={styles.postPreview}>
          <h3>
            <Link href="/blog/blog-yazi-1">
              Bilgisayar Mühendisliğinde Kendimi Geliştirme Yolculuğum
            </Link>
          </h3>
          <p className={styles.postAuthor}>Yazar: Samet Anaz</p>
          <time dateTime="2025-04-24" className={styles.postDate}>
            24 Nisan 2025
          </time>
          <p className={styles.postExcerpt}>
            Merhaba! Ben Samet, şu anda üniversite 3. sınıf Bilgisayar Mühendisliği öğrencisiyim. Bu
            yazıda sizlerle hem kendimi nasıl geliştirdiğimi hem de bu süreçte edindiğim bazı deneyimleri
            paylaşmak istiyorum. Belki benim yolculuğum, bu alanda ilerlemek isteyen başkalarına da
            ilham olur.
          </p>
        </article>
      </section>
    </>
  );
}
