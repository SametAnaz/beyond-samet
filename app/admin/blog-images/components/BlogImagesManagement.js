'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import styles from './BlogImagesManagement.module.css';

export default function BlogImagesManagement() {
  const [images, setImages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Resimler ve postları paralel yükle
      const [imagesRes, postsRes] = await Promise.all([
        fetch('/api/blog/images'),
        fetch('/api/posts')
      ]);
      
      const imagesData = await imagesRes.json();
      const postsData = await postsRes.json();
      
      if (imagesData.success) {
        setImages(imagesData.images);
      }
      
      if (postsData.success) {
        setPosts(postsData.posts);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yeni resim yükle
  const handleUpload = async (formData) => {
    try {
      setUploading(true);
      
      const response = await fetch('/api/blog/images', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadData(); // Listeyi yenile
        setShowForm(false);
        alert('Resim başarıyla yüklendi!');
      } else {
        alert(`Yükleme hatası: ${data.error}`);
      }
    } catch (error) {
      console.error('Yükleme hatası:', error);
      alert('Resim yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  // Resim güncelle
  const handleUpdate = async (id, updateData) => {
    try {
      const response = await fetch(`/api/blog/images?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadData(); // Listeyi yenile
        setEditingImage(null);
        alert('Resim başarıyla güncellendi!');
      } else {
        alert(`Güncelleme hatası: ${data.error}`);
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Resim güncellenemedi');
    }
  };

  // Resim sil
  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" resmini silmek istediğinizden emin misiniz?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/blog/images?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadData(); // Listeyi yenile
        alert('Resim başarıyla silindi!');
      } else {
        alert(`Silme hatası: ${data.error}`);
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Resim silinemedi');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Blog resimleri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Blog Resimleri ({images.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={styles.addButton}
          disabled={uploading}
        >
          {showForm ? 'İptal' : '+ Yeni Resim'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <UploadForm
          onSubmit={handleUpload}
          onCancel={() => setShowForm(false)}
          posts={posts}
          uploading={uploading}
        />
      )}

      {/* Images List */}
      <div className={styles.imagesList}>
        {images.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Henüz blog resmi yüklenmemiş.</p>
            <button
              onClick={() => setShowForm(true)}
              className={styles.addButton}
            >
              İlk resmi yükle
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                posts={posts}
                isEditing={editingImage === image.id}
                onEdit={() => setEditingImage(image.id)}
                onCancelEdit={() => setEditingImage(null)}
                onUpdate={(updateData) => handleUpdate(image.id, updateData)}
                onDelete={() => handleDelete(image.id, image.title)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Upload Form Component
function UploadForm({ onSubmit, onCancel, posts, uploading }) {
  const [formData, setFormData] = useState({
    file: null,
    title: '',
    alt: '',
    description: '',
    postSlug: '',
    order: 999
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('Lütfen bir resim seçin');
      return;
    }
    
    const submitData = new FormData();
    submitData.append('file', formData.file);
    submitData.append('title', formData.title || formData.file.name);
    submitData.append('alt', formData.alt || formData.title || formData.file.name);
    submitData.append('description', formData.description);
    submitData.append('postSlug', formData.postSlug);
    submitData.append('order', formData.order);
    
    onSubmit(submitData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.split('.')[0]
      }));
    }
  };

  return (
    <div className={styles.uploadForm}>
      <h3>Yeni Blog Resmi Yükle</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Resim Dosyası *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            disabled={uploading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Başlık</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Resim başlığı"
            disabled={uploading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Alt Text</label>
          <input
            type="text"
            value={formData.alt}
            onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
            placeholder="Alt text (SEO için)"
            disabled={uploading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Açıklama</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Resim açıklaması"
            rows={3}
            disabled={uploading}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Hangi Blog Yazısı</label>
          <select
            value={formData.postSlug}
            onChange={(e) => setFormData(prev => ({ ...prev, postSlug: e.target.value }))}
            disabled={uploading}
          >
            <option value="">Herhangi bir yazıya bağlı değil</option>
            {posts.map((post) => (
              <option key={post.slug} value={post.slug}>
                {post.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Sıra</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 999 }))}
            min="0"
            max="9999"
            disabled={uploading}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={uploading} className={styles.submitButton}>
            {uploading ? 'Yükleniyor...' : 'Yükle'}
          </button>
          <button type="button" onClick={onCancel} disabled={uploading} className={styles.cancelButton}>
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

// Image Card Component
function ImageCard({ image, posts, isEditing, onEdit, onCancelEdit, onUpdate, onDelete }) {
  const [editData, setEditData] = useState({
    title: image.title,
    alt: image.alt,
    description: image.description,
    postSlug: image.postSlug || '',
    order: image.order
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate(editData);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const postTitle = posts.find(p => p.slug === image.postSlug)?.title || 'Bağlı değil';

  return (
    <div className={styles.imageCard}>
      <div className={styles.imagePreview}>
        <OptimizedImage
          src={image.url}
          alt={image.alt}
          width={300}
          height={200}
          className={styles.image}
        />
      </div>

      <div className={styles.imageInfo}>
        {isEditing ? (
          <form onSubmit={handleUpdate} className={styles.editForm}>
            <div className={styles.formGroup}>
              <label>Başlık</label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Alt Text</label>
              <input
                type="text"
                value={editData.alt}
                onChange={(e) => setEditData(prev => ({ ...prev, alt: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Açıklama</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Blog Yazısı</label>
              <select
                value={editData.postSlug}
                onChange={(e) => setEditData(prev => ({ ...prev, postSlug: e.target.value }))}
              >
                <option value="">Bağlı değil</option>
                {posts.map((post) => (
                  <option key={post.slug} value={post.slug}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Sıra</label>
              <input
                type="number"
                value={editData.order}
                onChange={(e) => setEditData(prev => ({ ...prev, order: parseInt(e.target.value) || 999 }))}
                min="0"
                max="9999"
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton}>
                Kaydet
              </button>
              <button type="button" onClick={onCancelEdit} className={styles.cancelButton}>
                İptal
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3>{image.title}</h3>
            <p className={styles.description}>{image.description}</p>
            
            <div className={styles.metadata}>
              <div>
                <strong>Alt:</strong> {image.alt}
              </div>
              <div>
                <strong>Blog Yazısı:</strong> {postTitle}
              </div>
              <div>
                <strong>Sıra:</strong> {image.order}
              </div>
              <div>
                <strong>Boyut:</strong> {formatFileSize(image.size)}
              </div>
              <div>
                <strong>Tür:</strong> {image.type}
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={onEdit} className={styles.editButton}>
                Düzenle
              </button>
              <button onClick={onDelete} className={styles.deleteButton}>
                Sil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
