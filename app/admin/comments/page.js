'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommentDetails from '../components/CommentDetails';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  async function fetchComments() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/comments');
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      } else {
        throw new Error(data.error || 'Yorumlar alınamadı');
      }
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
      // Admin API rotasını kullanarak yorum silme işlemi
      const response = await fetch(`/api/comments/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yorum silinirken bir hata oluştu');
      }
      
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
        message: error.message || 'Yorum silinirken bir hata oluştu.'
      });
    }
  };

  const handleToggleVisibility = async (commentId, newApprovalState) => {
    try {
      // Admin API rotasını kullanarak yorum onay durumunu değiştirme işlemi
      const response = await fetch(`/api/comments/update-visibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          commentId,
          approved: newApprovalState 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yorum güncellenirken bir hata oluştu');
      }
      
      setAlert({
        show: true,
        type: 'success',
        message: `Yorum başarıyla ${newApprovalState === 1 ? 'onaylandı' : 'beklemeye alındı'}.`
      });
      fetchComments(); // Listeyi yenile
    } catch (error) {
      console.error('Yorum güncellenirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.message || 'Yorum güncellenirken bir hata oluştu.'
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewDetails = (comment) => {
    setSelectedComment(comment);
  };

  const closeDetails = () => {
    setSelectedComment(null);
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
            <Link href="/admin/posts">
              <span className="admin-nav-icon">📝</span>
              Blog Yazıları
            </Link>
          </li>
          <li>
            <Link href="/admin/comments" className="active">
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
            <h1>Yorumlar</h1>
            <p>Blog yazılarına yapılan yorumları yönetin</p>
          </div>
          <div className="admin-actions">
            <button className="admin-btn btn-primary" onClick={fetchComments}>
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
            <div className="loading-text">Yorumlar yükleniyor...</div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">Tüm Yorumlar</div>
              <div>{comments.length} yorum bulundu</div>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>E-posta</th>
                    <th>Blog Yazısı</th>
                    <th>Tarih</th>
                    <th>Yorum</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="flex-col flex-center gap-2">
                          <span style={{ fontSize: '1.5rem' }}>💬</span>
                          <div>Henüz yorum bulunmamaktadır.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    comments.map(comment => (
                      <tr key={comment.id} className={comment.approved === 0 ? 'hidden-row' : ''}>
                        <td>{comment.name}</td>
                        <td>{comment.email || '-'}</td>
                        <td className="truncate">{comment.slug}</td>
                        <td>
                          {comment.createdAt 
                            ? new Date(comment.createdAt).toLocaleDateString('tr-TR')
                            : '-'}
                        </td>
                        <td className="truncate">{comment.content}</td>
                        <td>
                          <span className={comment.approved === 0 ? 'status-hidden' : 'status-visible'}>
                            {comment.approved === 0 ? 'Bekliyor' : 'Onaylandı'}
                          </span>
                        </td>
                        <td>
                          <div className="flex-center gap-2">
                            <button 
                              className="admin-btn btn-primary btn-sm"
                              onClick={() => handleViewDetails(comment)}
                            >
                              Detay
                            </button>
                            <button 
                              className="admin-btn btn-secondary btn-sm"
                              onClick={() => handleToggleVisibility(comment.id, comment.approved === 1 ? 0 : 1)}
                            >
                              {comment.approved === 0 ? 'Onayla' : 'Beklet'}
                            </button>
                            <button 
                              className="admin-btn btn-danger btn-sm"
                              onClick={() => handleDelete(comment.id)}
                            >
                              Sil
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
      
      {selectedComment && (
        <CommentDetails 
          comment={selectedComment} 
          onClose={closeDetails} 
        />
      )}
    </div>
  );
} 