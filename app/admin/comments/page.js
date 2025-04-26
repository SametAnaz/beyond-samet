'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  async function fetchComments() {
    try {
      setLoading(true);
      // Normalde orderBy('createdAt', 'desc') kullanılmalı ancak indeks gerektirebilir
      const commentsQuery = query(collection(db, 'comments'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const commentsList = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Client tarafında sıralama
      commentsList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return 0;
      });
      
      setComments(commentsList);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Yorumlar yüklenirken bir hata oluştu.'
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (commentId) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      setAlert({
        show: true,
        type: 'success',
        message: 'Yorum başarıyla silindi.'
      });
      fetchComments(); // Listeyi yenile
    } catch (error) {
      console.error('Yorum silinirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Yorum silinirken bir hata oluştu.'
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
            <Link href="/admin/posts">
              Blog Yazıları
            </Link>
          </li>
          <li>
            <Link href="/admin/comments" className="active">
              Yorumlar
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="admin-content">
        <h1>Yorumlar</h1>
        
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
                <th>İsim</th>
                <th>E-posta</th>
                <th>Blog Yazısı</th>
                <th>IP Adresi</th>
                <th>Tarih</th>
                <th>Yorum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    Henüz yorum bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                comments.map(comment => (
                  <tr key={comment.id}>
                    <td>{comment.name}</td>
                    <td>{comment.email || '-'}</td>
                    <td className="truncate">{comment.slug}</td>
                    <td>{comment.ipAddress || '-'}</td>
                    <td>
                      {comment.createdAt 
                        ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString('tr-TR')
                        : '-'}
                    </td>
                    <td className="truncate">{comment.content}</td>
                    <td>
                      <button 
                        className="admin-btn btn-danger btn-sm"
                        onClick={() => handleDelete(comment.id)}
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