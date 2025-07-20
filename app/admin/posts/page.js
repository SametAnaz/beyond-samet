'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function fetchPostsDirectly() {
    try {
      setLoading(true);
      
      // MySQL API'den tüm post'ları al
      const response = await fetch('/api/posts', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Postlari yuklerken hata olustu');
      }
      
      const data = await response.json();
      
      if (!data.posts || data.posts.length === 0) {
        console.log("Hiç blog yazısı bulunamadı");
        setPosts([]);
        return;
      }
      
      const postsList = data.posts.map(post => {
        console.log("Blog yazısı:", post.id, post);
        
        // Tarih formatla
        const createdAtDate = post.createdAt ? new Date(post.createdAt) : null;
        
        return {
          id: post.id,
          ...post,
          formattedDate: createdAtDate ? createdAtDate.toLocaleDateString('tr-TR') : '-'
        };
      });
      
      console.log("Toplam bulunan blog yazısı:", postsList.length);
      setPosts(postsList);
    } catch (error) {
      console.error('Blog yazıları yüklenirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Blog yazıları yüklenirken bir hata oluştu: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPostsDirectly();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Bu blog yazısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      // MySQL API ile sil
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Post silinirken hata olustu');
      }
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Blog yazısı başarıyla silindi.'
      });
      fetchPostsDirectly(); // Listeyi yenile
    } catch (error) {
      console.error('Post silinirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Blog yazısı silinirken bir hata oluştu.'
      });
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
          <li>
            <Link href="/admin/gallery">
              <span className="admin-nav-icon">🖼️</span>
              Galeri
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-title">
            <h1>Blog Yazıları</h1>
            <p>Tüm blog yazılarınızı burada yönetin</p>
          </div>
          <div className="admin-actions">
            <Link href="/admin/posts/new" className="admin-btn btn-primary">
              <span>+</span> Yeni Yazı
            </Link>
            <button className="admin-btn btn-secondary" onClick={fetchPostsDirectly}>
              <span>🔄</span> Yenile
            </button>
          </div>
        </div>
        
        {alert.show && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span>{alert.type === 'success' ? '✅' : '❌'}</span>
            {alert.message}
          </div>
        )}
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Blog yazıları yükleniyor...</div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Tüm Blog Yazıları</div>
              <div>{posts.length} yazı bulundu</div>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th className="hide-mobile">Yazar</th>
                    <th className="hide-mobile">Slug</th>
                    <th className="hide-mobile">Tarih</th>
                    <th className="hide-mobile">Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="flex-col flex-center gap-2">
                          <span style={{ fontSize: '1.5rem' }}>📝</span>
                          <div>Henüz blog yazısı bulunmamaktadır.</div>
                          <Link href="/admin/posts/new" className="admin-btn btn-primary btn-sm mt-4">
                            Yeni Yazı Oluştur
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    posts.map(post => (
                      <tr key={post.id || post.slug}>
                        <td className="truncate">
                          <div className="mobile-row-info">
                            <span className="mobile-title">{post.title}</span>
                            <span className="mobile-meta show-mobile">
                              {post.author} &bull; {post.formattedDate}
                            </span>
                          </div>
                        </td>
                        <td className="hide-mobile">{post.author}</td>
                        <td className="truncate hide-mobile">{post.slug || post.id}</td>
                        <td className="hide-mobile">{post.formattedDate}</td>
                        <td className="hide-mobile">
                          <span className="status-published">Yayında</span>
                        </td>
                        <td>
                          <div className="flex-center gap-2 mobile-actions">
                            <Link 
                              href={`/admin/posts/edit/${post.id || post.slug}`}
                              className="admin-btn btn-primary btn-sm"
                            >
                              <span className="btn-icon">✏️</span>
                              <span className="btn-text hide-mobile">Düzenle</span>
                            </Link>
                            <Link 
                              href={`/blog/${post.slug || post.id}`}
                              target="_blank"
                              className="admin-btn btn-secondary btn-sm"
                            >
                              <span className="btn-icon">👁️</span>
                              <span className="btn-text hide-mobile">Görüntüle</span>
                            </Link>
                            <button 
                              className="admin-btn btn-danger btn-sm"
                              onClick={() => handleDelete(post.id || post.slug)}
                            >
                              <span className="btn-icon">🗑️</span>
                              <span className="btn-text hide-mobile">Sil</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 