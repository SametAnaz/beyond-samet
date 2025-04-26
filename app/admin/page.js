'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
      
      // Blog yazılarını getir
      const postsRef = collection(db, 'posts');
      const postsSnapshot = await getDocs(postsRef);
      
      console.log(`Dashboard: ${postsSnapshot.size} blog yazısı bulundu`);
      
      const posts = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        // Tarih alanlarını dönüştür
        let createdAtDate = null;
        if (data.createdAt) {
          createdAtDate = new Date(data.createdAt.seconds * 1000);
        } else if (data.date) {
          createdAtDate = new Date(data.date.seconds * 1000);
        }
        
        return {
          id: doc.id,
          ...data,
          slug: data.slug || doc.id,
          title: data.title || 'Başlıksız Yazı',
          author: data.author || 'Bilinmiyor',
          formattedDate: createdAtDate ? createdAtDate.toLocaleDateString('tr-TR') : '-'
        };
      });
      
      // Tarih sıralaması (manuel olarak)
      posts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : 
                     a.date ? new Date(a.date.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : 
                     b.date ? new Date(b.date.seconds * 1000) : new Date(0);
        return dateB - dateA;
      });
      
      // Yorumları getir
      const commentsQuery = query(collection(db, 'comments'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      console.log(`Dashboard: ${commentsSnapshot.size} yorum bulundu`);
      
      setStats({
        totalPosts: postsSnapshot.size,
        totalComments: commentsSnapshot.size,
        recentPosts: posts.slice(0, 5) // Son 5 yazıyı al
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