'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addPost } from '@/lib/firebase-posts';
import { serverTimestamp } from 'firebase/firestore';
import dynamic from 'next/dynamic';

// React-markdown editörü client tarafında çalıştırmak için
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

export default function NewPost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    excerpt: '',
    content: '',
    slug: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [previewMode, setPreviewMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      
      console.log('Yeni blog yazısı oluşturuluyor. Markdown -> HTML dönüşümü başlıyor.');
      // Process markdown to HTML
      const processedContent = await fetch('/api/markdown-to-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown: formData.content }),
      }).then(res => res.json());
      
      console.log('Yeni blog yazısı Firebase\'e kaydediliyor.');
      const slug = formData.slug ? formData.slug.trim() : '';
      
      await addPost({
        title: formData.title,
        author: formData.author,
        excerpt: formData.excerpt || formData.title,
        content: formData.content, // Original markdown content
        contentHtml: processedContent.html || '', // Processed HTML content
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        slug: slug
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Blog yazısı başarıyla oluşturuldu!'
      });
      
      // 2 saniye sonra blog yazıları listesine geri dön
      setTimeout(() => {
        router.push('/admin/posts');
      }, 2000);
    } catch (error) {
      console.error('Blog yazısı oluşturulurken hata:', error);
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

  const generateSlugFromTitle = () => {
    if (!formData.title) return;
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Non-alphanumeric karakterleri kaldır
      .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
      .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
      .trim();
      
    setFormData(prev => ({ ...prev, slug }));
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
            <h1>Yeni Blog Yazısı</h1>
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
        
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              {previewMode ? 'Yazı Önizleme' : 'Yazı Detayları'}
            </div>
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
                  <label htmlFor="slug">URL Slug</label>
                  <div className="form-input-group">
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      className="form-control"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="orn-blog-yazisi-slug (Boş bırakılırsa otomatik oluşturulur)"
                    />
                    <button 
                      type="button" 
                      className="admin-btn btn-secondary form-input-btn"
                      onClick={generateSlugFromTitle}
                      disabled={!formData.title}
                    >
                      Oluştur
                    </button>
                  </div>
                  <div className="form-help">
                    <span className="form-help-icon">ℹ️</span>
                    <span>Yazınızın URL'de görünecek kısmı. Boş bırakırsanız otomatik oluşturulur.</span>
                  </div>
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
                      Markdown formatında yazabilirsiniz. Örn: # Başlık, **kalın**, *italik*, [link](url)
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
                        <span>📝</span>
                        Yazıyı Yayınla
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
      </div>
      
      <style jsx>{`
        .form-input-group {
          display: flex;
          gap: 0.5rem;
        }
        
        .form-input-btn {
          white-space: nowrap;
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
      `}</style>
    </div>
  );
} 