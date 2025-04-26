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
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      if (!formData.title || !formData.author || !formData.content) {
        throw new Error('Lütfen gerekli alanları doldurun.');
      }

      const slug = generateSlug(formData.title);
      
      // HTML yerine markdown olarak kaydet
      await addPost({
        slug,
        title: formData.title,
        author: formData.author,
        excerpt: formData.excerpt || formData.title,
        content: formData.content,
        contentHtml: formData.content, // Markdown olarak içerik
        date: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Blog yazısı başarıyla eklendi!'
      });
      
      // 2 saniye sonra blog yazıları listesine geri dön
      setTimeout(() => {
        router.push('/admin/posts');
      }, 2000);
    } catch (error) {
      console.error('Blog yazısı eklenirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: `Hata: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <ul className="admin-nav">
          <li>
            <Link href="/admin">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/posts" className="active">
              Blog Yazıları
            </Link>
          </li>
          <li>
            <Link href="/admin/comments">
              Yorumlar
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="admin-content">
        <div className="flex-between mb-2">
          <h1>Yeni Blog Yazısı</h1>
          <div>
            <button 
              type="button" 
              className={`admin-btn ${previewMode ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              style={{ marginRight: '0.5rem' }}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? 'Düzenleme Modu' : 'Önizleme'}
            </button>
            <Link href="/admin/posts">
              <button className="admin-btn btn-secondary btn-sm">İptal</button>
            </Link>
          </div>
        </div>
        
        {alert.show && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alert.message}
          </div>
        )}
        
        <div className="admin-form">
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
                <small style={{ marginTop: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>
                  Markdown formatında yazabilirsiniz. Örn: # Başlık, **kalın**, *italik*, [link](url)
                </small>
              </div>
              
              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="admin-btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          ) : (
            <div className="markdown-preview">
              <h1>{formData.title || 'Başlık'}</h1>
              <div className="author-info">
                <span>{formData.author || 'Yazar'}</span>
              </div>
              <div className="markdown-content">
                <ReactMarkdown>{formData.content || '### Önizleme\n\nBurada içeriğinizin önizlemesi görünecek.'}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .markdown-preview {
          padding: 20px;
          background-color: var(--bg-primary);
          border-radius: 4px;
        }
        
        .author-info {
          margin-bottom: 20px;
          font-style: italic;
          color: var(--text-secondary);
        }
        
        .markdown-content {
          line-height: 1.7;
        }
        
        .form-buttons {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
} 