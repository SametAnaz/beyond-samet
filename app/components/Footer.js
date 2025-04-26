import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <h2 className={styles.title}>Beyond Samet</h2>
            <p className={styles.description}>
              Bilgisayar Mühendisliği öğrencisi, yazılım geliştirici ve teknoloji meraklısı
            </p>
          </div>
          
          <div className={styles.linksSection}>
            <div className={styles.linkGroup}>
              <h3 className={styles.linkTitle}>Sayfalar</h3>
              <ul className={styles.linkList}>
                <li><Link href="/">Ana Sayfa</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/about">Hakkımda</Link></li>
                <li><Link href="/gallery">Galeri</Link></li>
                <li><Link href="/contact">İletişim</Link></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h3 className={styles.linkTitle}>Sosyal</h3>
              <ul className={styles.linkList}>
                <li>
                  <a 
                    href="https://github.com/SametAnaz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.linkedin.com/in/samet-anaz-995349291/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; {currentYear} Samet Anaz. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
} 