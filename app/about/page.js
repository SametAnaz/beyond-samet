'use client';

import Image from 'next/image';
import styles from '../../styles/pages/about.module.css';

const skills = [
  {
    title: 'Backend Geliştirme',
    items: ['Node.js', 'Express.js', 'REST API tasarımı', 'MySQL ve veri modelleme'],
  },
  {
    title: 'AI ve Otomasyon',
    items: ['Veri odaklı çözümler', 'Prompt ve LLM tabanlı akışlar', 'Otomasyon scriptleri', 'İş süreçlerini sadeleştirme'],
  },
  {
    title: 'DevOps ve Sistem',
    items: ['Sunucu kurulumu ve yönetimi', 'Dağıtım süreçleri', 'Ortam yapılandırma', 'Versiyonlama ve CI yaklaşımı'],
  },
];

const focusAreas = [
  'Ölçeklenebilir web uygulamaları',
  'Performans ve bakım kolaylığı',
  'Üretim ortamı güvenilirliği',
  'Modern yazılım mimarileri',
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroMediaWrap}>
            <div className={styles.heroGlow} />
            <Image
              src="/assets/images/me7.png"
              alt="Samet Anaz"
              width={280}
              height={280}
              className={styles.avatar}
              priority
            />
          </div>

          <div className={styles.heroContent}>
            <p className={styles.kicker}>Bilgisayar Mühendisliği Öğrencisi</p>
            <h1 className={styles.title}>Samet Anaz</h1>
            <p className={styles.lead}>
              Backend ve AI odaklı sistemler geliştiren, ölçeklenebilir ürünler ve güvenilir operasyon süreçleri üzerine çalışan bir yazılım geliştiricisiyim.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaBadge}>Backend</span>
              <span className={styles.metaBadge}>AI Sistemleri</span>
              <span className={styles.metaBadge}>DevOps</span>
            </div>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Yolculuğum</h2>
          <p className={styles.sectionText}>
            Recep Tayyip Erdoğan Üniversitesi Bilgisayar Mühendisliği bölümünde eğitim alırken, yazılım geliştirme sürecini sadece kod yazma olarak değil, tasarım, mimari ve operasyon bütünlüğü olarak ele alıyorum.
          </p>
          <p className={styles.sectionText}>
            Çalışmalarımda sürdürülebilirlik, performans ve ekip içinde anlaşılır yapı kurmak önceliğimdir.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Uzmanlık Alanları</h2>
          <div className={styles.skillsGrid}>
            {skills.map((group) => (
              <article key={group.title} className={styles.skillCard}>
                <h3 className={styles.skillTitle}>{group.title}</h3>
                <ul className={styles.skillList}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Odak Noktalarım</h2>
          <div className={styles.focusGrid}>
            {focusAreas.map((item) => (
              <div key={item} className={styles.focusItem}>{item}</div>
            ))}
          </div>
        </section>

        <section className={styles.contactCard}>
          <div>
            <h2 className={styles.sectionTitle}>İletişim</h2>
            <p className={styles.sectionText}>
              Proje, iş birliği veya teknik bir konu hakkında konuşmak için benimle iletişime geçebilirsin.
            </p>
          </div>
          <a href="mailto:sametanaz.tr@gmail.com" className={styles.mailLink}>
            sametanaz.tr@gmail.com
          </a>
        </section>

        <section className={styles.cvCard}>
          <h2 className={styles.cvTitle}>Özgeçmiş</h2>
          <p className={styles.cvText}>Detaylı CV dosyamı doğrudan indirerek deneyimlerimi inceleyebilirsin.</p>
          <a
            href="/assets/docs/samet-anaz-cv.pdf"
            download="Samet-Anaz-CV.pdf"
            className={styles.downloadButton}
          >
            CV&apos;yi İndir
          </a>
        </section>
      </div>
    </main>
  );
} 