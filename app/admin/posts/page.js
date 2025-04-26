'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  async function fetchPosts() {
    try {
      setLoading(true);
      const postsQuery = query(collection(db, 'posts'), orderBy('date', 'desc'));
      const postsSnapshot = await getDocs(postsQuery);
      const postsList = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsList);
    } catch (error) {
      console.error('Blog yazıları yüklenirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Blog yazıları yüklenirken bir hata oluştu.'
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setAlert({
        show: true,
        type: 'success',
        message: 'Blog yazısı başarıyla silindi.'
      });
      fetchPosts(); // Listeyi yenile
    } catch (error) {
      console.error('Blog yazısı silinirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Blog yazısı silinirken bir hata oluştu.'
      });
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
          <h1>Blog Yazıları</h1>
          <Link href="/admin/posts/new">
            <button className="admin-btn btn-primary">Yeni Yazı Ekle</button>
          </Link>
        </div>
        
        {alert.show && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alert.message}
          </div>
        )}
        
        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Yazar</th>
                <th>Tarih</th>
                <th>Özet</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    Henüz blog yazısı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id}>
                    <td className="truncate">{post.title}</td>
                    <td>{post.author}</td>
                    <td>
                      {post.date instanceof Date 
                        ? post.date.toLocaleDateString('tr-TR')
                        : new Date(post.date?.seconds * 1000).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="truncate">{post.excerpt}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link href={`/admin/posts/edit/${post.id}`} style={{ marginRight: '8px' }}>
                        <button className="admin-btn btn-secondary btn-sm">Düzenle</button>
                      </Link>
                      <button 
                        className="admin-btn btn-danger btn-sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 