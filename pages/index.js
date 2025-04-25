// pages/index.js
import React from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      {/* Hero Bölümü */}
      <section className={styles.hero}>
        <h1>Samet Anaz</h1>
        <div className={styles.socialLinks}>
          <a
            href="https://github.com/SametAnaz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <img
              src="/assets/images/github-mark.png"
              alt="GitHub"
              width={16}
              height={16}
              className={styles.socialIcon}
            />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/samet-anaz-995349291/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <img
              src="/assets/images/linkedin-logo.png"
              alt="LinkedIn"
              width={16}
              height={16}
              className={styles.socialIcon}
            />
            LinkedIn
          </a>
        </div>
      </section>

      {/* Blog Giriş Bölümü */}
      <section className={styles.blogIntro}>
        <h2>Bloglarım</h2>

        {/* 1. Yazı */}
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
            Merhaba! Ben Samet, şu anda üniversite 3. sınıf Bilgisayar Mühendisliği öğrencisiyim.
            Bu yazıda sizlerle hem kendimi nasıl geliştirdiğimi hem de bu süreçte edindiğim bazı
            deneyimleri paylaşmak istiyorum. Belki benim yolculuğum, bu alanda ilerlemek isteyen
            başkalarına da ilham olur.{" "}
            <Link href="/blog/blog-yazi-1">Devamını Oku</Link>
          </p>
        </article>

        {/* 2. Yazı */}
        <article className={styles.postPreview}>
          <h3>
            <Link href="/blog/akilli-geri-donusum-projesi">
              Akıllı Geri Dönüşüm Projesi
            </Link>
          </h3>
          <p className={styles.postAuthor}>
            Yazar: Samet Anaz &amp; Mustafa Güneyli
          </p>
          <time dateTime="2022-02-10" className={styles.postDate}>
            10 Şubat 2022
          </time>
          <p className={styles.postExcerpt}>
            Geri dönüşüm kutularının kullanımını sensör, NFC ve mobil uygulama ile
            daha etkin hâle getiren bir proje.{" "}
            <Link href="/blog/akilli-geri-donusum-projesi">Devamını Oku</Link>
          </p>
        </article>

        {/* 3. Yazı */}
        <article className={styles.postPreview}>
          <h3>
            <Link href="/blog/inekwiz">
              Akıllı Tarımın Yeni Yüzü: İnekWiz ile Çiftlikler Dijitalleşiyor
            </Link>
          </h3>
          <p className={styles.postAuthor}>
            Yazar: Samet Anaz &amp; Ali Emre
          </p>
          <time dateTime="2025-04-26" className={styles.postDate}>
            15 Ekim 2025
          </time>
          <p className={styles.postExcerpt}>
            İnekWiz, çiftliklerdeki ineklerin sağlık ve verimliliğini artırmak için
            tasarlanmış bir IoT projesidir. Proje, ineklerin sağlık durumunu izlemek
            ve verimliliklerini artırmak amacıyla çeşitli sensörler ve bir mobil uygulama
            kullanmaktadır. Bu sayede çiftlik sahipleri, ineklerinin sağlık durumunu
            anlık olarak takip edebilir ve gerektiğinde müdahale edebilirler.{" "}
            <Link href="/blog/inekwiz">
              Devamını Oku
            </Link>
          </p>
        </article>
      </section>
    </main>
  );
}
