'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import styles from './ImageSelector.module.css';

export default function ImageSelector({ isOpen, onClose, onSelect }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBlogImages();
    }
  }, [isOpen]);

  const fetchBlogImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blog/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image) => {
    const markdownText = `![${image.alt || image.title}](${image.url})`;
    onSelect(markdownText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>📷 Resim Seç</h3>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Resimler yükleniyor...</div>
          ) : images.length === 0 ? (
            <div className={styles.empty}>
              <p>Henüz blog resmi yüklenmemiş.</p>
              <a 
                href="/admin/blog-images" 
                target="_blank" 
                className={styles.uploadBtn}
              >
                İlk resmi yükle
              </a>
            </div>
          ) : (
            <div className={styles.imageGrid}>
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className={styles.imageCard}
                  onClick={() => handleImageSelect(image)}
                >
                  <OptimizedImage
                    src={image.url}
                    alt={image.alt || image.title}
                    width={150}
                    height={100}
                    className={styles.image}
                  />
                  <div className={styles.imageInfo}>
                    <p className={styles.imageTitle}>{image.title}</p>
                    {image.postSlug && (
                      <span className={styles.imageBadge}>Bağlı</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.footer}>
          <a 
            href="/admin/blog-images" 
            target="_blank" 
            className={styles.manageLink}
          >
            📁 Resimleri Yönet
          </a>
          <button onClick={onClose} className={styles.cancelBtn}>
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
