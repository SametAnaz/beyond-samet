import Image from 'next/image';
import styles from '../../styles/pages/about.module.css';

export const metadata = {
  title: 'Hakkımda',
  description: 'Samet Anaz kimdir? Eğitim, deneyim ve ilgi alanları hakkında bilgi.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hakkımda</h1>
      
      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          <Image
            src="/assets/images/me5.png"
            alt="Samet Anaz"
            width={200}
            height={200}
            className={styles.avatar}
          />
        </div>
        <div className={styles.profileInfo}>
          <p className={styles.lead}>
            Merhaba! Ben <strong>Samet Anaz</strong>, Bilgisayar Mühendisliği 3. sınıf öğrencisi,
            geliştirici ve teknoloji meraklısıyım.
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Eğitim ve Yolculuk</h2>
        <p>
          Recep Tayyip Erdoğan Üniversitesi'nde Bilgisayar Mühendisliği eğitimi alıyorum.
          Üniversiteye başladığımdan beri algoritma, veri yapıları, yapay zeka
          ve web teknolojileri üzerine çalışarak kendimi sürekli geliştiriyorum.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Uzmanlık Alanlarım</h2>
        <div className={styles.skillsGrid}>
          <div className={styles.skillItem}>
            <h3 className={styles.skillName}>Web Geliştirme</h3>
            <ul className={styles.skillList}>
              <li>JavaScript (ES6+)</li>
              <li>React.js &amp; Next.js</li>
              <li>Node.js &amp; Express</li>
              <li>CSS3, CSS Modules &amp; Tailwind</li>
            </ul>
          </div>
          <div className={styles.skillItem}>
            <h3 className={styles.skillName}>Araçlar &amp; Teknolojiler</h3>
            <ul className={styles.skillList}>
              <li>Git &amp; GitHub</li>
              <li>RESTful API Tasarımı</li>
              <li>MongoDB &amp; SQL</li>
              <li>AWS &amp; Vercel</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>İlgi Alanlarım</h2>
        <p>
          Açık kaynak projelere katkı sağlamak, IoT tabanlı uygulamalar geliştirmek, 
          yapay zeka destekli sistemler tasarlamak ve mobil uygulama geliştirmek
          temel ilgi alanlarım arasında yer alıyor. Ayrıca yeni programlama dilleri
          ve teknolojileri öğrenmekten büyük keyif alıyorum.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>İletişim</h2>
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
      
      {/* CV Download Container */}
      <section className={styles.cvContainer}>
        <div className={styles.cvContent}>
          <h2 className={styles.cvTitle}>Özgeçmişim</h2>
          <p className={styles.cvText}>
            Detaylı özgeçmişimi indirmek için aşağıdaki butona tıklayabilirsiniz.
          </p>
          <a 
            href="/assets/docs/samet-anaz-cv.pdf" 
            download="Samet-Anaz-CV.pdf"
            className={styles.downloadButton}
          >
            <svg 
              className={styles.downloadIcon} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            CV'yi İndir
          </a>
        </div>
      </section>
    </div>
  );
} 