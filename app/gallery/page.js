import styles from '../../styles/pages/gallery.module.css';
import Image from 'next/image';

export const metadata = {
  title: 'Galeri',
  description: 'Projelerim ve etkinliklerim hakkında fotoğraflar',
};

async function getGalleryImages() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/gallery`, {
      cache: 'no-store' // Her zaman fresh data al
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch gallery images');
    }
    
    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export default async function GalleryPage() {
  const images = await getGalleryImages();
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Galeri</h1>
      <p className={styles.description}>
        Projelerim ve katıldığım etkinliklerden kareler
      </p>
      
      {images.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Henüz hiç fotoğraf yüklenmemiş.</p>
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {images.map((image, index) => (
            <div key={image.id} className={styles.imageContainer}>
              <Image
                src={image.url}
                alt={image.name || `Galeri resmi ${index + 1}`}
                width={600}
                height={400}
                className={styles.image}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              <div className={styles.imageCaption}>
                {image.title || image.name || `Resim ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 