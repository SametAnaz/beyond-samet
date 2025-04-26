import styles from '../../styles/pages/gallery.module.css';
import Image from 'next/image';

export const metadata = {
  title: 'Galeri',
  description: 'Projelerim ve etkinliklerim hakkında fotoğraflar',
};

export default function GalleryPage() {
  const images = [
    {
      src: '/assets/images/me1.jpg',
      alt: 'Profil Fotoğrafı',
      width: 600,
      height: 400,
    },
    {
      src: '/assets/images/me2.jpg',
      alt: 'Proje Çalışması',
      width: 600,
      height: 400,
    },
    {
      src: '/assets/images/me3.jpg',
      alt: 'Teknoloji Etkinliğinde',
      width: 600,
      height: 400,
    },
  ];
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Galeri</h1>
      <p className={styles.description}>
        Projelerim ve katıldığım etkinliklerden kareler
      </p>
      
      <div className={styles.galleryGrid}>
        {images.map((image, index) => (
          <div key={index} className={styles.imageContainer}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className={styles.image}
            />
            <div className={styles.imageCaption}>{image.alt}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 