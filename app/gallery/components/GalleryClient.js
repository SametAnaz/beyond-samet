'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../../../styles/pages/gallery.module.css';

export default function GalleryClient({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const goToNext = () => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  // Touch event handlers for swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, selectedIndex]);

  return (
    <>
      <div className={styles.galleryGrid}>
        {images.map((image, index) => (
          <div key={image.id} className={styles.imageContainer}>
            <Image
              src={image.url}
              alt={image.title || image.name || `Galeri resmi ${index + 1}`}
              width={600}
              height={400}
              className={styles.image}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onClick={() => openLightbox(image, index)}
              style={{ cursor: 'pointer' }}
            />
            <div className={styles.imageCaption}>
              {image.title || image.name || `Resim ${index + 1}`}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className={styles.lightbox}
          onClick={closeLightbox}
        >
          <div 
            className={styles.lightboxContent} 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close Button */}
            <button 
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label="Kapat"
            >
              ×
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button 
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={goToPrevious}
                  aria-label="Önceki resim"
                >
                  ‹
                </button>
                <button 
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={goToNext}
                  aria-label="Sonraki resim"
                >
                  ›
                </button>
              </>
            )}

            {/* Main Image */}
            <div className={styles.lightboxImageContainer}>
              <Image
                src={selectedImage.url}
                alt={selectedImage.title || selectedImage.name || 'Galeri resmi'}
                fill
                className={styles.lightboxImage}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>

            {/* Image Info */}
            <div className={styles.lightboxInfo}>
              <h3 className={styles.lightboxTitle}>
                {selectedImage.title || selectedImage.name || `Resim ${selectedIndex + 1}`}
              </h3>
              {selectedImage.description && (
                <p className={styles.lightboxDescription}>
                  {selectedImage.description}
                </p>
              )}
              <p className={styles.lightboxCounter}>
                {selectedIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
