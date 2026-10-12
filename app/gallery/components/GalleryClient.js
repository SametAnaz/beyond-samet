'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/pages/gallery.module.css';

function layout(image) {
  const ratio = (image.width || 600) / (image.height || 400);
  return ratio < 0.9 ? styles.imageContainerPortrait : ratio <= 1.15 ? styles.imageContainerSquare : styles.imageContainerLandscape;
}
export default function GalleryClient({ images }) {
  const [index, setIndex] = useState(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const touch = useRef(null);
  const selected = index === null ? null : images[index];
  const isOpen = Boolean(selected);
  useEffect(() => {
    if (!isOpen) return;
    const element = dialog.current;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = overflow; trigger.current?.focus(); };
  }, [isOpen]);
  const close = () => setIndex(null);
  const move = direction => setIndex(current => (current + direction + images.length) % images.length);
  return <>
    <div className={styles.galleryGrid}>{images.map((image, i) => <button key={image.id} type="button" className={`${styles.imageContainer} ${layout(image)}`} onClick={event => { trigger.current = event.currentTarget; setIndex(i); }} aria-label={`${image.title || 'Görsel'}: büyüt`}>
      <Image src={image.url} alt={image.title || 'Galeri görseli'} width={image.width || 600} height={image.height || 400} sizes="(max-width: 640px) 92vw, (max-width: 1000px) 46vw, 580px" className={styles.image} />
      <span className={styles.imageCaption}>{image.title || 'Görsel'}</span>
    </button>)}</div>
    {selected && <dialog ref={dialog} className={styles.lightbox} aria-labelledby="gallery-image-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } }}>
      <div className={styles.lightboxContent} onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => { if (touch.current !== null) { const delta = touch.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 50) move(delta > 0 ? 1 : -1); } touch.current = null; }}>
        <button type="button" className={styles.closeButton} onClick={close} aria-label="Kapat" autoFocus>×</button>
        {images.length > 1 && <><button type="button" className={`${styles.navButton} ${styles.prevButton}`} onClick={() => move(-1)} aria-label="Önceki görsel">‹</button><button type="button" className={`${styles.navButton} ${styles.nextButton}`} onClick={() => move(1)} aria-label="Sonraki görsel">›</button></>}
        <div className={styles.lightboxImageContainer}><Image src={selected.url} alt={selected.title || 'Galeri görseli'} fill sizes="92vw" className={styles.lightboxImage} priority /></div>
        <div className={styles.lightboxInfo}><h2 id="gallery-image-title" className={styles.lightboxTitle}>{selected.title || 'Görsel'}</h2>{selected.description && <p className={styles.lightboxDescription}>{selected.description}</p>}<p className={styles.lightboxCounter} aria-live="polite">{index + 1} / {images.length}</p></div>
      </div>
    </dialog>}
  </>;
}
