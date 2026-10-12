import { getAllGalleryImages } from '@/lib/mysql-gallery';
import styles from '../../styles/pages/gallery.module.css';
import GalleryClient from './components/GalleryClient';

export const metadata = {
  title: 'Galeri',
  description: 'Projelerim ve etkinliklerim hakkında fotoğraflar',
};

async function getGalleryImages() {
  const result = await getAllGalleryImages();
  if (!result.success) throw new Error('Galeri yüklenemedi');
  return result.images;
}

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const images = await getGalleryImages();
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.kicker}>Beyond Samet</p>
        <h1 className={styles.title}>Galeri</h1>
        <p className={styles.description}>
          Projelerim ve katıldığım etkinliklerden kareler
        </p>
        <div className={styles.headerMeta}>
          <span className={styles.metaPill}>{images.length} görsel</span>
          <span className={styles.metaPill}>Arşiv</span>
        </div>
      </header>
      
      {images.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>Henüz görsel yüklenmemiş</h2>
          <p>Yeni fotoğraflar eklendiğinde burada görüntülenecek.</p>
        </div>
      ) : (
        <GalleryClient images={images} />
      )}
    </div>
  );
} 