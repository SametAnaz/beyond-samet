// pages/about.js
import React from "react";
import Head from "next/head";
import styles from "../styles/About.module.css";

export default function About() {
  return (
    <>
      <Head>
        <title>Hakkımda – Beyond Samet</title>
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>Hakkımda</h1>
        <p className={styles.lead}>
          Merhaba! Ben <strong>Samet Anaz</strong>, Bilgisayar Mühendisliği 3. sınıf öğrencisi,
          geliştirici ve teknoloji meraklısıyım.
        </p>

        <section className={styles.section}>
          <h2>Eğitim ve Yolculuk</h2>
          <p>
            Recep Tayyip Erdoğan Üniversitesi’nde Bilgisayar Mühendisliği eğitimi alıyorum.
            Üniversiteye başladığımdan beri algoritma, veri yapıları, yapay zeka
            ve web teknolojileri üzerine çalışarak kendimi sürekli geliştiriyorum.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Uzmanlık Alanlarım</h2>
          <ul className={styles.list}>
            <li>JavaScript (ES6+)</li>
            <li>React.js &amp; Next.js</li>
            <li>Node.js &amp; Express</li>
            <li>CSS3 &amp; CSS Modules</li>
            <li>Git &amp; GitHub</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>İlgi Alanlarım</h2>
          <p>
            Açık kaynak projelere katkı, IoT tabanlı uygulamalar,
            yapay zeka destekli sistemler ve mobil uygulama geliştirme.
          </p>
        </section>

        <section className={styles.section}>
          <h2>İletişim</h2>
          <p>
            Bana{" "}
            <a
              href="mailto:sametanaz.tr@gmail.com"
              className={styles.link}
            >
              sametanaz.tr@gmail.com
            </a>{" "}
            adresinden veya sosyal medya hesaplarımdan ulaşabilirsiniz.
          </p>
        </section>
      </main>
    </>
  );
}
