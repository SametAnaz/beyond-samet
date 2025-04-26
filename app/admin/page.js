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

  useEffect(() => {
    async function fetchStats() {
      try {
        // Blog yazılarını getir
        const postsQuery = query(collection(db, 'posts'), orderBy('date', 'desc'));
        const postsSnapshot = await getDocs(postsQuery);
        const posts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Yorumları getir
        const commentsQuery = query(collection(db, 'comments'));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        setStats({
          totalPosts: postsSnapshot.size,
          totalComments: commentsSnapshot.size,
          recentPosts: posts.slice(0, 5) // Son 5 yazıyı al
        });
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <ul className="admin-nav">
          <li>
            <Link href="/admin" className="active">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/posts">
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
        <h1>Admin Dashboard</h1>
        
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Toplam Blog Yazısı</h3>
            <div className="value">{stats.totalPosts}</div>
          </div>
          
          <div className="stat-card">
            <h3>Toplam Yorum</h3>
            <div className="value">{stats.totalComments}</div>
          </div>
        </div>
        
        <div className="recent-posts mb-2">
          <div className="flex-between">
            <h2>Son Eklenen Yazılar</h2>
            <Link href="/admin/posts/new">
              <button className="admin-btn btn-primary btn-sm">Yeni Yazı Ekle</button>
            </Link>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Tarih</th>
                <th>Yazar</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPosts.length === 0 ? (
                <tr>
                  <td colSpan="4">Henüz blog yazısı bulunmamaktadır.</td>
                </tr>
              ) : (
                stats.recentPosts.map(post => (
                  <tr key={post.id}>
                    <td className="truncate">{post.title}</td>
                    <td>
                      {post.date instanceof Date 
                        ? post.date.toLocaleDateString('tr-TR')
                        : new Date(post.date?.seconds * 1000).toLocaleDateString('tr-TR')}
                    </td>
                    <td>{post.author}</td>
                    <td>
                      <Link href={`/admin/posts/edit/${post.id}`}>
                        <button className="admin-btn btn-secondary btn-sm">Düzenle</button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 