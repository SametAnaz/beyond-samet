'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import styles from './ImageSelector.module.css';

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Sol' },
  { value: 'center', label: 'Orta', recommended: true },
  { value: 'right', label: 'Sağ' },
];

const WIDTH_UNIT_OPTIONS = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
];

const DEFAULT_WIDTH_VALUE = '720';

export default function ImageSelector({ isOpen, onClose, onSelect }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [settings, setSettings] = useState({
    alt: '',
    caption: '',
    align: 'center',
    widthValue: DEFAULT_WIDTH_VALUE,
    widthUnit: 'px',
  });

  useEffect(() => {
    if (isOpen) {
      fetchBlogImages();
      setSelectedImage(null);
      setSettings({
        alt: '',
        caption: '',
        align: 'center',
        widthValue: DEFAULT_WIDTH_VALUE,
        widthUnit: 'px',
      });
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
    setSelectedImage(image);
    setSettings({
      alt: image.alt || image.title || '',
      caption: image.description || image.title || '',
      align: 'center',
      widthValue: DEFAULT_WIDTH_VALUE,
      widthUnit: 'px',
    });
  };

  const getPreviewPresentation = () => {
    const rawWidth = Number(settings.widthValue);
    const safeWidth = Number.isFinite(rawWidth) && rawWidth > 0
      ? rawWidth
      : Number(DEFAULT_WIDTH_VALUE);

    if (settings.widthUnit === '%') {
      const normalizedPercent = Math.min(100, Math.max(1, safeWidth));
      const pixelWidth = Math.round((1200 * normalizedPercent) / 100);
      return {
        width: pixelWidth,
        height: Math.round(pixelWidth * 0.5625),
        containerStyle: {
          width: `${normalizedPercent}%`,
          maxWidth: '100%',
          margin: '0 auto',
        },
      };
    }

    const normalizedPx = Math.min(2000, Math.max(200, safeWidth));
    return {
      width: normalizedPx,
      height: Math.round(normalizedPx * 0.5625),
      containerStyle: {
        width: `${normalizedPx}px`,
        maxWidth: '100%',
        margin: '0 auto',
      },
    };
  };

  const buildMarkdown = () => {
    if (!selectedImage) {
      return '';
    }

    const alt = (settings.alt || selectedImage.alt || selectedImage.title || 'Blog görseli')
      .replace(/"/g, "'")
      .trim();
    const metadata = [];

    metadata.push(`align=${settings.align}`);
    if (settings.widthValue) {
      metadata.push(`width=${settings.widthValue}${settings.widthUnit}`);
    }

    if (settings.caption.trim()) {
      metadata.push(`caption=${encodeURIComponent(settings.caption.trim())}`);
    }

    return `![${alt}](${selectedImage.url} "${metadata.join('|')}")`;
  };

  const handleInsert = () => {
    const markdownText = buildMarkdown();

    if (!markdownText) {
      return;
    }

    onSelect(markdownText);
    onClose();
  };

  if (!isOpen) return null;

  const previewPresentation = getPreviewPresentation();

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
            <div className={styles.browserLayout}>
              <div className={styles.imageGrid}>
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    className={`${styles.imageCard} ${selectedImage?.id === image.id ? styles.imageCardSelected : ''}`}
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
                  </button>
                ))}
              </div>

              <aside className={styles.settingsPanel}>
                {selectedImage ? (
                  <>
                    <div className={styles.previewBox}>
                      <OptimizedImage
                        src={selectedImage.url}
                        alt={settings.alt || selectedImage.alt || selectedImage.title}
                        width={previewPresentation.width}
                        height={previewPresentation.height}
                        containerStyle={previewPresentation.containerStyle}
                        className={styles.previewImage}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Alt Metin</label>
                      <input
                        type="text"
                        value={settings.alt}
                        onChange={(e) => setSettings(prev => ({ ...prev, alt: e.target.value }))}
                        placeholder="Görsel için açıklayıcı alt metin"
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Caption</label>
                      <textarea
                        value={settings.caption}
                        onChange={(e) => setSettings(prev => ({ ...prev, caption: e.target.value }))}
                        rows={3}
                        placeholder="Görsel altına açıklama"
                      />
                    </div>

                    <div className={styles.inlineFields}>
                      <div className={styles.fieldGroup}>
                        <label>Konum</label>
                        <select
                          value={settings.align}
                          onChange={(e) => setSettings(prev => ({ ...prev, align: e.target.value }))}
                        >
                          {ALIGN_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label>Genişlik birimi</label>
                        <select
                          value={settings.widthUnit}
                          onChange={(e) => setSettings(prev => ({ ...prev, widthUnit: e.target.value }))}
                        >
                          {WIDTH_UNIT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Genişlik değeri</label>
                      <input
                        type="number"
                        min="1"
                        max={settings.widthUnit === '%' ? '100' : '2000'}
                        step={settings.widthUnit === '%' ? '1' : '10'}
                        value={settings.widthValue}
                        onChange={(e) => setSettings(prev => ({ ...prev, widthValue: e.target.value }))}
                        placeholder={settings.widthUnit === '%' ? 'ör. 75' : 'ör. 720'}
                      />
                    </div>

                    <div className={styles.helperText}>
                      Yüzde seçerseniz görsel yazı alanına göre ölçeklenir. Px seçerseniz sabit genişlik kullanılır.
                    </div>

                    <div className={styles.insertActions}>
                      <button type="button" className={styles.insertBtn} onClick={handleInsert}>
                        Yazıya Ekle
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.settingsEmpty}>
                    <p>Bir görsel seçin. Ardından boyut, hizalama ve açıklama ayarlarını burada düzenleyin.</p>
                  </div>
                )}
              </aside>
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
