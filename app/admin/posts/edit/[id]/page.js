'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { use } from 'react';
import ImageSelector from '../../../components/ImageSelector';

const CustomMarkdown = dynamic(() => import('@/components/CustomMarkdown'), { ssr: false });

export default function EditPost({ params }) {
  const router = useRouter();
  const contentRef = useRef(null);
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

  const updateContentWithSelection = (transformer) => {
    const textarea = contentRef.current;

    if (!textarea) {
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const nextState = transformer({ value, selectionStart, selectionEnd });

    setFormData(prev => ({
      ...prev,
      content: nextState.value,
    }));

    window.requestAnimationFrame(() => {
      textarea.focus();
      if (
        typeof nextState.selectionStart === 'number' &&
        typeof nextState.selectionEnd === 'number'
      ) {
        textarea.setSelectionRange(nextState.selectionStart, nextState.selectionEnd);
      }
    });
  };

  const wrapSelection = (before, after = before, placeholder = 'metin') => {
    updateContentWithSelection(({ value, selectionStart, selectionEnd }) => {
      const selectedText = value.slice(selectionStart, selectionEnd) || placeholder;
      const nextValue = `${value.slice(0, selectionStart)}${before}${selectedText}${after}${value.slice(selectionEnd)}`;
      const cursorStart = selectionStart + before.length;
      const cursorEnd = cursorStart + selectedText.length;

      return {
        value: nextValue,
        selectionStart: cursorStart,
        selectionEnd: cursorEnd,
      };
    });
  };

  const insertBlock = (snippet, selectLength = snippet.length) => {
    updateContentWithSelection(({ value, selectionStart, selectionEnd }) => {
      const nextValue = `${value.slice(0, selectionStart)}${snippet}${value.slice(selectionEnd)}`;
      const cursorStart = selectionStart + snippet.length - selectLength;

      return {
        value: nextValue,
        selectionStart: cursorStart,
        selectionEnd: cursorStart + selectLength,
      };
    });
  };

  const prefixLines = (prefix, placeholder = 'satır') => {
    updateContentWithSelection(({ value, selectionStart, selectionEnd }) => {
      const selectedText = value.slice(selectionStart, selectionEnd) || placeholder;
      const prefixedText = selectedText
        .split('\n')
        .map(line => `${prefix}${line}`)
        .join('\n');

      const nextValue = `${value.slice(0, selectionStart)}${prefixedText}${value.slice(selectionEnd)}`;

      return {
        value: nextValue,
        selectionStart,
        selectionEnd: selectionStart + prefixedText.length,
      };
    });
  };

  const insertLink = () => {
    updateContentWithSelection(({ value, selectionStart, selectionEnd }) => {
      const selectedText = value.slice(selectionStart, selectionEnd) || 'link metni';
      const snippet = `[${selectedText}](https://)`;
      const nextValue = `${value.slice(0, selectionStart)}${snippet}${value.slice(selectionEnd)}`;
      const linkStart = selectionStart + selectedText.length + 3;

      return {
        value: nextValue,
        selectionStart: linkStart,
        selectionEnd: linkStart + 8,
      };
    });
  };

  const insertTable = () => {
    const snippet = `| Sütun 1 | Sütun 2 |\n| --- | --- |\n| Veri | Veri |\n`;
    insertBlock(snippet, 0);
  };

  const handleEditorKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      insertBlock('  ', 2);
      return;
    }

    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 'b') {
      event.preventDefault();
      wrapSelection('**', '**');
      return;
    }

    if (key === 'i') {
      event.preventDefault();
      wrapSelection('*', '*');
      return;
    }

    if (key === 'k') {
      event.preventDefault();
      insertLink();
    }
  };

  const contentWords = formData.content.trim().length
    ? formData.content.trim().split(/\s+/).length
    : 0;
  const estimatedReadMinutes = Math.max(1, Math.ceil(contentWords / 200));
  const contentCharacters = formData.content.length;
  const contentLines = formData.content ? formData.content.split('\n').length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      if (!formData.title || !formData.author || !formData.content) {
        throw new Error('Lütfen gerekli alanları doldurun.');
      }
      
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
                    <div className="editor-panel">
                      <div className="editor-toolbar">
                        <div className="editor-group">
                          <button type="button" onClick={() => wrapSelection('**', '**')} className="editor-btn" title="Kalın metin (Ctrl/Cmd + B)">
                            <strong>B</strong>
                          </button>
                          <button type="button" onClick={() => wrapSelection('*', '*')} className="editor-btn" title="İtalik metin (Ctrl/Cmd + I)">
                            <em>I</em>
                          </button>
                          <button type="button" onClick={() => wrapSelection('`', '`', 'kod')} className="editor-btn" title="Satır içi kod">
                            {'</>'}
                          </button>
                          <button type="button" onClick={() => wrapSelection('~~', '~~')} className="editor-btn" title="Üstü çizili metin">
                            S
                          </button>
                        </div>

                        <div className="editor-divider" />

                        <div className="editor-group">
                          <button type="button" onClick={() => prefixLines('# ')} className="editor-btn" title="Başlık 1">
                            H1
                          </button>
                          <button type="button" onClick={() => prefixLines('## ')} className="editor-btn" title="Başlık 2">
                            H2
                          </button>
                          <button type="button" onClick={() => prefixLines('### ')} className="editor-btn" title="Başlık 3">
                            H3
                          </button>
                          <button type="button" onClick={() => prefixLines('> ')} className="editor-btn" title="Alıntı">
                            &ldquo;
                          </button>
                        </div>

                        <div className="editor-divider" />

                        <div className="editor-group">
                          <button type="button" onClick={() => prefixLines('- ')} className="editor-btn" title="Madde listesi">
                            • Liste
                          </button>
                          <button type="button" onClick={() => prefixLines('1. ')} className="editor-btn" title="Numaralı liste">
                            1.
                          </button>
                          <button type="button" onClick={() => prefixLines('- [ ] ')} className="editor-btn" title="Görev listesi">
                            ☐ Görev
                          </button>
                          <button type="button" onClick={() => insertBlock('\n---\n', 0)} className="editor-btn" title="Ayırıcı çizgi">
                            ---
                          </button>
                        </div>

                        <div className="editor-divider" />

                        <div className="editor-group">
                          <button type="button" onClick={insertLink} className="editor-btn" title="Bağlantı ekle (Ctrl/Cmd + K)">
                            Link
                          </button>
                          <button type="button" onClick={() => setShowImageSelector(true)} className="editor-btn image-btn" title="Resim Markdown ekle">
                            📷 Resim
                          </button>
                          <button type="button" onClick={() => insertBlock('```\nkod bloğu\n```\n', 9)} className="editor-btn" title="Kod bloğu">
                            ```
                          </button>
                          <button type="button" onClick={insertTable} className="editor-btn" title="Tablo ekle">
                            Tablo
                          </button>
                        </div>
                      </div>

                      <div className="editor-shortcuts">
                        Kısayollar: <span>Ctrl/Cmd + B</span> kalın, <span>Ctrl/Cmd + I</span> italik, <span>Ctrl/Cmd + K</span> link, <span>Tab</span> girinti
                      </div>
                    </div>
                    <textarea
                      id="content"
                      name="content"
                      ref={contentRef}
                      className="form-control"
                      value={formData.content}
                      onChange={handleChange}
                      onKeyDown={handleEditorKeyDown}
                      required
                      rows="18"
                      placeholder="Markdown formatında yazınızı buraya yazın..."
                    />
                    <div className="form-help">
                      <span className="form-help-icon">ℹ️</span>
                      <span className="form-help-text">
                        Markdown formatında yazabilirsiniz. Seçili metne biçim uygulamak için üst araç çubuğunu kullanın.
                      </span>
                    </div>
                    <div className="editor-stats">
                      <span>{contentWords} kelime</span>
                      <span>{contentCharacters} karakter</span>
                      <span>{contentLines} satır</span>
                      <span>Yaklaşık {estimatedReadMinutes} dk okuma</span>
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
                  <div className="preview-shell">
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
                      <CustomMarkdown content={formData.content || '### Önizleme\n\nBurada içeriğinizin önizlemesi görünecek.'} />
                    </div>
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
          gap: 0.75rem;
          margin-top: 0.65rem;
          padding: 0.9rem 1rem;
          border: 1px solid var(--admin-border);
          border-radius: 0.75rem;
          background-color: var(--admin-bg-main);
          font-size: 0.875rem;
          color: var(--admin-text-tertiary);
          line-height: 1.5;
        }
        
        .form-help-icon {
          flex: 0 0 auto;
          margin-top: 0.05rem;
        }

        .form-help-text {
          color: var(--admin-text-secondary);
        }
        
        .form-submit {
          margin-top: 1.5rem;
        }
        
        .markdown-preview {
          padding: 0;
        }

        .preview-shell {
          display: grid;
          gap: 1rem;
          padding: 1.5rem;
          border: 1px solid var(--admin-border);
          border-radius: 0.875rem;
          background: linear-gradient(180deg, var(--admin-bg-main), var(--admin-bg-card));
        }
        
        .preview-title {
          margin: 0;
          font-size: clamp(1.6rem, 2.6vw, 2.1rem);
          color: var(--admin-text-primary);
          line-height: 1.2;
        }
        
        .preview-meta {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
          color: var(--admin-text-tertiary);
          font-size: 0.875rem;
        }

        .preview-meta span {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.7rem;
          border: 1px solid var(--admin-border);
          border-radius: 999px;
          background-color: var(--admin-bg-main);
        }
        
        .preview-excerpt {
          margin: 0;
          padding: 0.9rem 1rem;
          border-left: 4px solid var(--admin-primary);
          border-radius: 0.75rem;
          background-color: var(--admin-bg-main);
          color: var(--admin-text-secondary);
          font-style: italic;
          line-height: 1.65;
        }
        
        .preview-content {
          line-height: 1.75;
          color: var(--admin-text-secondary);
        }

        .preview-content :global(h1),
        .preview-content :global(h2),
        .preview-content :global(h3),
        .preview-content :global(h4) {
          color: var(--admin-text-primary);
          margin: 1.25rem 0 0.75rem;
        }

        .preview-content :global(p),
        .preview-content :global(ul),
        .preview-content :global(ol) {
          margin-bottom: 1rem;
        }

        .preview-content :global(code) {
          padding: 0.15rem 0.4rem;
          border-radius: 0.35rem;
          background-color: var(--admin-bg-main);
          color: var(--admin-primary);
          font-size: 0.92em;
        }

        .preview-content :global(pre) {
          overflow-x: auto;
          padding: 1rem;
          border: 1px solid var(--admin-border);
          border-radius: 0.75rem;
          background-color: var(--admin-bg-main);
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
          flex-wrap: wrap;
          gap: 0.6rem;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }

        .editor-panel {
          display: grid;
          gap: 0.75rem;
          padding: 0.9rem;
          border: 1px solid var(--admin-border);
          border-radius: 0.9rem;
          background: linear-gradient(180deg, var(--admin-bg-main), var(--admin-bg-card));
          box-shadow: var(--admin-shadow-sm);
        }

        .editor-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .editor-divider {
          width: 1px;
          align-self: stretch;
          background-color: var(--admin-border);
        }
        
        .editor-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          min-height: 2.35rem;
          padding: 0.5rem 0.9rem;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          color: var(--admin-text-primary);
          border-radius: 0.7rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--admin-shadow-sm);
        }
        
        .editor-btn:hover {
          background: var(--admin-bg-main);
          border-color: var(--admin-primary);
          transform: translateY(-1px);
          box-shadow: var(--admin-shadow-md);
        }

        .editor-btn:focus-visible {
          outline: 2px solid var(--admin-primary);
          outline-offset: 2px;
        }
        
        .image-btn {
          background: rgba(16, 185, 129, 0.12);
          color: var(--admin-success);
          border-color: rgba(16, 185, 129, 0.35);
        }
        
        .image-btn:hover {
          background: rgba(16, 185, 129, 0.18);
          border-color: var(--admin-success);
        }

        .editor-shortcuts {
          margin-top: 0;
          padding: 0.7rem 0.9rem;
          border-radius: 0.75rem;
          background-color: var(--admin-bg-main);
          border: 1px solid var(--admin-border);
          color: var(--admin-text-tertiary);
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .editor-shortcuts span {
          display: inline-flex;
          align-items: center;
          padding: 0.1rem 0.45rem;
          margin: 0 0.15rem;
          border-radius: 999px;
          background-color: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          color: var(--admin-text-primary);
          font-weight: 600;
        }

        .editor-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.85rem;
        }

        .editor-stats span {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.7rem;
          border-radius: 999px;
          border: 1px solid var(--admin-border);
          background-color: var(--admin-bg-main);
          color: var(--admin-text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .editor-toolbar {
            align-items: stretch;
          }

          .editor-divider {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .preview-shell {
            padding: 1rem;
          }

          .preview-meta {
            gap: 0.5rem;
          }

          .preview-meta span {
            width: 100%;
            justify-content: center;
          }

          .editor-toolbar {
            padding: 0.75rem;
          }

          .editor-group {
            width: 100%;
          }

          .editor-btn {
            flex: 1 1 calc(50% - 0.25rem);
          }

          .editor-shortcuts {
            font-size: 0.78rem;
          }

          .editor-stats span {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
      
      {/* Image Selector Modal */}
      <ImageSelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={(markdownText) => {
          insertBlock(`\n\n${markdownText}\n\n`, 0);
        }}
      />
    </div>
  );
} 