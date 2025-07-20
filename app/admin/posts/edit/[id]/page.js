'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { use } from 'react';
import ImageSelector from '../../../components/ImageSelector';

// React-markdown editörü client tarafında çalıştırmak için
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

export default function EditPost({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    excerpt: '',
    content: '',
    slug: ''
  });
  const [contentLoading, setContentLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [previewMode, setPreviewMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        setContentLoading(true);
        console.log(`Edit page: ${id} ID'li blog yazısı yükleniyor...`);
        
        // MySQL API'den post'u al - önce tüm post'ları çek, sonra ID ile filtrele
        const response = await fetch('/api/posts', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Postları yüklerken hata oluştu');
        }
        
        const data = await response.json();
        const postData = data.posts.find(p => p.id === id);
        
        if (!postData) {
          throw new Error('Blog yazısı bulunamadı');
        }
        
        console.log(`Edit page: ${id} ID'li blog yazısı yüklendi:`, postData);
        
        setPost(postData);
        setFormData({
          title: postData.title || '',
          author: postData.author || '',
          excerpt: postData.excerpt || '',
          content: postData.content || '',
          slug: postData.slug || ''
        });
      } catch (error) {
        console.error('Blog yazısı yüklenirken hata:', error);
        setAlert({
          show: true,
          type: 'error',
          message: 'Blog yazısı yüklenirken bir hata oluştu: ' + error.message
        });
      } finally {
        setContentLoading(false);
      }
    }
    
    if (id) {
      loadPost();
    } else {
      console.error('Blog düzenleme sayfası için ID parametre eksik');
      setAlert({
        show: true,
        type: 'error',
        message: 'Blog yazısı ID değeri bulunamadı.'
      });
      setContentLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      if (!formData.title || !formData.author || !formData.content) {
        throw new Error('Lütfen gerekli alanları doldurun.');
      }
      
      console.log(`Edit page: ${id} ID'li blog yazısı güncellemesi Markdown -> HTML dönüşümü başlıyor.`);
      // Process markdown to HTML
      const processedContent = await fetch('/api/markdown-to-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown: formData.content }),
      }).then(res => res.json());
      
      console.log(`Edit page: ${id} ID'li blog yazısı güncelleniyor.`);
      
      // MySQL API ile güncelle
      const response = await fetch(`/api/posts?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          excerpt: formData.excerpt || formData.title,
          content: formData.content, // Original markdown content
          slug: formData.slug
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Blog yazısı güncellenemedi');
      }

      setAlert({
        show: true,
        type: 'success',
        message: 'Blog yazısı başarıyla güncellendi!'
      });
      
      // 2 saniye sonra blog yazıları listesine geri dön
      setTimeout(() => {
        router.push('/admin/posts');
      }, 2000);
    } catch (error) {
      console.error('Blog yazısı güncellenirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: `Hata: ${error.message}`
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-logo">
            <div className="admin-brand-icon">B</div>
            <h1>Beyond Admin</h1>
          </div>
          <button className="admin-mobile-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <ul className="admin-nav">
          <div className="admin-nav-section">Ana Menü</div>
          <li>
            <Link href="/admin">
              <span className="admin-nav-icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/posts" className="active">
              <span className="admin-nav-icon">📝</span>
              Blog Yazıları
            </Link>
          </li>
          <li>
            <Link href="/admin/comments">
              <span className="admin-nav-icon">💬</span>
              Yorumlar
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-title">
            <h1>Blog Yazısını Düzenle</h1>
            <p>Değişiklikleriniz kaydedildiğinde otomatik olarak yayınlanacaktır</p>
          </div>
          <div className="admin-actions">
            <button 
              type="button" 
              className={`admin-btn ${previewMode ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <span>{previewMode ? '✏️' : '👁️'}</span>
              {previewMode ? 'Düzenleme Modu' : 'Önizleme'}
            </button>
            <Link href="/admin/posts" className="admin-btn btn-secondary">
              <span>↩️</span> İptal
            </Link>
          </div>
        </div>
        
        {alert.show && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span>{alert.type === 'success' ? '✅' : '❌'}</span>
            {alert.message}
          </div>
        )}
        
        {contentLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Blog yazısı yükleniyor...</div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">
                {previewMode ? 'Yazı Önizleme' : 'Yazı Detayları'}
              </div>
              {post?.slug && (
                <div className="admin-card-meta">
                  Slug: <code>{post.slug}</code>
                </div>
              )}
            </div>
            
            <div className="admin-card-body">
              {!previewMode ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">Başlık *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-control"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="author">Yazar *</label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      className="form-control"
                      value={formData.author}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="excerpt">Özet</label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      className="form-control"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="Yazınızın kısa bir özeti"
                      rows="2"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="content">İçerik *</label>
                    <div className="editor-toolbar">
                      <button
                        type="button"
                        onClick={() => setShowImageSelector(true)}
                        className="editor-btn image-btn"
                        title="Resim Ekle"
                      >
                        📷 Resim Ekle
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '\n\n## ' }))}
                        className="editor-btn"
                        title="Başlık Ekle"
                      >
                        📝 Başlık
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '**kalın metin**' }))}
                        className="editor-btn"
                        title="Kalın"
                      >
                        <strong>B</strong>
                      </button>
                    </div>
                    <textarea
                      id="content"
                      name="content"
                      className="form-control"
                      value={formData.content}
                      onChange={handleChange}
                      required
                      rows="15"
                      placeholder="Markdown formatında yazınızı buraya yazın..."
                    />
                    <div className="form-help">
                      <span className="form-help-icon">ℹ️</span>
                      <span className="form-help-text">
                        HTML veya Markdown formatında yazabilirsiniz. Örn: # Başlık, **kalın**, *italik*, [link](url)
                      </span>
                    </div>
                  </div>
                  
                  <div className="form-submit">
                    <button 
                      type="submit" 
                      className="admin-btn btn-primary btn-lg"
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <>
                          <span className="btn-spinner"></span>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          Değişiklikleri Kaydet
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="markdown-preview">
                  <h1 className="preview-title">{formData.title || 'Başlık'}</h1>
                  <div className="preview-meta">
                    <span className="preview-author">{formData.author || 'Yazar'}</span>
                    <span className="preview-date">
                      {new Date().toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  {formData.excerpt && (
                    <div className="preview-excerpt">
                      {formData.excerpt}
                    </div>
                  )}
                  <div className="preview-content">
                    <ReactMarkdown>{formData.content || '### Önizleme\n\nBurada içeriğinizin önizlemesi görünecek.'}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .admin-card-meta {
          font-size: 0.875rem;
          color: var(--admin-text-tertiary);
        }
        
        .admin-card-meta code {
          background-color: var(--admin-bg-main);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .form-help {
          display: flex;
          align-items: flex-start;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: var(--admin-text-tertiary);
        }
        
        .form-help-icon {
          margin-right: 0.5rem;
        }
        
        .form-submit {
          margin-top: 1.5rem;
        }
        
        .markdown-preview {
          padding: 1.5rem;
        }
        
        .preview-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--admin-text-primary);
        }
        
        .preview-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          color: var(--admin-text-tertiary);
          font-size: 0.875rem;
        }
        
        .preview-excerpt {
          font-style: italic;
          margin-bottom: 1.5rem;
          padding-left: 1rem;
          border-left: 4px solid var(--admin-primary);
          color: var(--admin-text-secondary);
        }
        
        .preview-content {
          line-height: 1.7;
        }
        
        .btn-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .editor-toolbar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        
        .editor-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .editor-btn:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
        
        .image-btn {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }
        
        .image-btn:hover {
          background: #059669;
          border-color: #059669;
        }
      `}</style>
      
      {/* Image Selector Modal */}
      <ImageSelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={(markdownText) => {
          setFormData(prev => ({ 
            ...prev, 
            content: prev.content + '\n\n' + markdownText + '\n\n' 
          }));
        }}
      />
    </div>
  );
} 