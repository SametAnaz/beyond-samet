'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayoutWrapper from './components/AdminLayoutWrapper';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    recentPosts: []
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log("Dashboard: İstatistikleri yüklemeye başlıyor...");
      
      // MySQL API'den blog yazılarını getir
      const postsResponse = await fetch('/api/posts', {
        cache: 'no-store'
      });
      
      let totalPosts = 0;
      let recentPosts = [];
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        totalPosts = postsData.posts.length;
        
        console.log(`Dashboard: ${totalPosts} blog yazısı bulundu`);
        
        const posts = postsData.posts.map(post => {
          const createdAtDate = post.createdAt ? new Date(post.createdAt) : null;
          
          return {
            ...post,
            formattedDate: createdAtDate ? createdAtDate.toLocaleDateString('tr-TR') : '-'
          };
        });
        
        // Tarih sıralaması (en yeni en üstte)
        posts.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        recentPosts = posts.slice(0, 5); // Son 5 post
      }
      
      // MySQL API'den tüm yorumları getir (admin için)
      const commentsResponse = await fetch('/api/admin/comments', {
        cache: 'no-store'
      });
      
      let totalComments = 0;
      
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        totalComments = commentsData.comments ? commentsData.comments.length : 0;
        console.log(`Dashboard: ${totalComments} yorum bulundu`);
      }
      
      setStats({
        totalPosts,
        totalComments,
        recentPosts
      });
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
            <Link href="/admin" className="active">
              <span className="admin-nav-icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/posts">
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
          <li>
            <Link href="/admin/blog-images">
              <span className="admin-nav-icon">📸</span>
              Blog Resimleri
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <div className="admin-title">
            <h1>Dashboard</h1>
            <p>Admin paneli genel durum</p>
          </div>
          <div className="admin-actions">
            <button className="admin-btn btn-secondary" onClick={fetchStats}>
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Yenile</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Veriler yükleniyor...</div>
          </div>
        ) : (
          <>
            <div className="dashboard-summary">
              <div className="admin-card dashboard-card">
                <div className="dashboard-stat">
                  <div className="dashboard-stat-icon">📝</div>
                  <div className="dashboard-stat-value">{stats.totalPosts}</div>
                  <div className="dashboard-stat-label">Blog Yazısı</div>
                </div>
              </div>
              
              <div className="admin-card dashboard-card">
                <div className="dashboard-stat">
                  <div className="dashboard-stat-icon">💬</div>
                  <div className="dashboard-stat-value">{stats.totalComments}</div>
                  <div className="dashboard-stat-label">Yorum</div>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Son Blog Yazıları</div>
                <Link href="/admin/posts" className="admin-btn btn-sm btn-primary">
                  <span className="btn-icon">👁️</span>
                  <span className="btn-text">Tümünü Gör</span>
                </Link>
              </div>
              
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Başlık</th>
                      <th className="hide-mobile">Yazar</th>
                      <th className="hide-mobile">Tarih</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPosts.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
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
                      stats.recentPosts.map(post => (
                        <tr key={post.id}>
                          <td className="truncate">
                            <div className="mobile-row-info">
                              <span className="mobile-title">{post.title}</span>
                              <span className="mobile-meta show-mobile">
                                {post.author} • {post.formattedDate}
                              </span>
                            </div>
                          </td>
                          <td className="hide-mobile">{post.author}</td>
                          <td className="hide-mobile">{post.formattedDate}</td>
                          <td>
                            <div className="flex-center gap-2 mobile-actions">
                              <Link href={`/admin/posts/edit/${post.id}`} className="admin-btn btn-primary btn-sm">
                                <span className="btn-icon">✏️</span>
                                <span className="btn-text hide-mobile">Düzenle</span>
                              </Link>
                              <Link href={`/blog/${post.slug}`} target="_blank" className="admin-btn btn-secondary btn-sm">
                                <span className="btn-icon">👁️</span>
                                <span className="btn-text hide-mobile">Görüntüle</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 