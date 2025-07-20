'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './GalleryManagement.module.css';

export default function GalleryManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    order: '1'
  });
  const [editingImage, setEditingImage] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    order: ''
  });
  const [message, setMessage] = useState('');

  // Resimleri yükle
  const loadImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
      } else {
        throw new Error('Failed to load images');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setMessage('Resimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // Dosya seçme
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        title: prev.title || file.name.split('.')[0]
      }));
    }
  };

  // Resim yükleme
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage('Lütfen bir dosya seçin');
      return;
    }

    setUploadLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title.trim());
      formData.append('description', uploadForm.description.trim());
      formData.append('order', uploadForm.order);

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Resim başarıyla yüklendi!');
        setSelectedFile(null);
        setUploadForm({ title: '', description: '', order: '1' });
        document.getElementById('fileInput').value = '';
        await loadImages(); // Listeyi yenile
      } else {
        setMessage(data.error || 'Yükleme hatası');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Yükleme sırasında hata oluştu');
    } finally {
      setUploadLoading(false);
    }
  };

  // Resim silme
  const handleDelete = async (imageUrl, imageName) => {
    if (!confirm(`"${imageName}" adlı resmi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch('/api/gallery/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Resim başarıyla silindi');
        await loadImages(); // Listeyi yenile
      } else {
        setMessage(data.error || 'Silme hatası');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Silme sırasında hata oluştu');
    }
  };

  // Düzenleme modunu başlat
  const startEdit = (image) => {
    setEditingImage(image.id);
    setEditForm({
      title: image.title || '',
      description: image.description || '',
      order: image.order?.toString() || '1'
    });
  };

  // Düzenleme modunu iptal et
  const cancelEdit = () => {
    setEditingImage(null);
    setEditForm({ title: '', description: '', order: '' });
  };

  // Resim bilgilerini güncelle
  const handleUpdate = async (imageId) => {
    try {
      const response = await fetch('/api/gallery/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: imageId,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          order: parseInt(editForm.order) || 1
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Resim bilgileri başarıyla güncellendi');
        setEditingImage(null);
        await loadImages(); // Listeyi yenile
      } else {
        setMessage(data.error || 'Güncelleme hatası');
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage('Güncelleme sırasında hata oluştu');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Resimler yükleniyor...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Yükleme Formu */}
      <div className={styles.uploadSection}>
        <h2>Yeni Resim Yükle</h2>
        <form onSubmit={handleUpload} className={styles.uploadForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="fileInput">Resim Dosyası:</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploadLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="imageTitle">Resim Başlığı:</label>
            <input
              id="imageTitle"
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Örn: Samet Anaz"
              disabled={uploadLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="imageDescription">Açıklama (isteğe bağlı):</label>
            <textarea
              id="imageDescription"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Resim hakkında açıklama..."
              rows={3}
              disabled={uploadLoading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="imageOrder">Sıra (1-999):</label>
            <input
              id="imageOrder"
              type="number"
              min="1"
              max="999"
              value={uploadForm.order}
              onChange={(e) => setUploadForm(prev => ({ ...prev, order: e.target.value }))}
              disabled={uploadLoading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!selectedFile || uploadLoading}
            className={styles.uploadButton}
          >
            {uploadLoading ? 'Yükleniyor...' : 'Resmi Yükle'}
          </button>
        </form>
        
        {selectedFile && (
          <div className={styles.previewSection}>
            <p>Seçilen dosya: {selectedFile.name}</p>
            <p>Boyut: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      {/* Mesaj Alanı */}
      {message && (
        <div className={`${styles.message} ${message.includes('başarıyla') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      {/* Mevcut Resimler */}
      <div className={styles.gallerySection}>
        <h2>Mevcut Resimler ({images.length})</h2>
        
        {images.length === 0 ? (
          <p className={styles.emptyState}>Henüz hiç resim yüklenmemiş.</p>
        ) : (
          <div className={styles.imageGrid}>
            {images.map((image) => (
              <div key={image.id} className={styles.imageCard}>
                <div className={styles.imageContainer}>
                  <Image
                    src={image.url}
                    alt={image.title || image.name}
                    width={300}
                    height={200}
                    className={styles.image}
                  />
                  <div className={styles.orderBadge}>#{image.order || 999}</div>
                </div>
                
                {editingImage === image.id ? (
                  <div className={styles.editForm}>
                    <div className={styles.inputGroup}>
                      <label>Başlık:</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className={styles.editInput}
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label>Açıklama:</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        className={styles.editInput}
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label>Sıra:</label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={editForm.order}
                        onChange={(e) => setEditForm(prev => ({ ...prev, order: e.target.value }))}
                        className={styles.editInput}
                      />
                    </div>
                    
                    <div className={styles.editActions}>
                      <button
                        onClick={() => handleUpdate(image.id)}
                        className={styles.saveButton}
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={cancelEdit}
                        className={styles.cancelButton}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.imageInfo}>
                    <h3>{image.title || image.fileName || 'Başlıksız'}</h3>
                    {image.description && (
                      <p className={styles.description}>{image.description}</p>
                    )}
                    <p>Boyut: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p>Tarih: {new Date(image.createdAt || image.uploadedAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                )}
                
                <div className={styles.imageActions}>
                  {editingImage !== image.id && (
                    <>
                      <button
                        onClick={() => startEdit(image)}
                        className={styles.editButton}
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(image.url)}
                        className={styles.copyButton}
                      >
                        URL Kopyala
                      </button>
                      <button
                        onClick={() => handleDelete(image.url, image.title || image.fileName)}
                        className={styles.deleteButton}
                      >
                        Sil
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
