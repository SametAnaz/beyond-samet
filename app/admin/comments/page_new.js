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
      
      // MySQL API'sinden tüm yorumları al
      const response = await fetch('/api/admin/comments');
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        console.error('Yorumlar yüklenirken hata:', response.statusText);
        setAlert({
          show: true,
          type: 'error',
          message: 'Yorumlar yüklenirken hata oluştu'
        });
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Yorumlar yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  const handleToggleVisibility = async (commentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      const response = await fetch('/api/comments/update-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          approved: newStatus
        }),
      });

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: `Yorum ${newStatus ? 'onaylandı' : 'gizlendi'}`
        });
        fetchComments(); // Listeyi yenile
      } else {
        throw new Error('Durum güncelleme hatası');
      }
    } catch (error) {
      console.error('Yorum durumu güncelleme hatası:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Yorum durumu güncellenirken hata oluştu'
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch('/api/comments/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Yorum başarıyla silindi'
        });
        fetchComments(); // Listeyi yenile
      } else {
        throw new Error('Silme hatası');
      }
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Yorum silinirken hata oluştu'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCommentClick = (comment) => {
    setSelectedComment(comment);
    setSidebarOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Yorum Yönetimi</h1>
          <div className="admin-actions">
            <Link href="/admin" className="admin-btn btn-secondary">
              <span>⬅️</span> Admin Panel
            </Link>
          </div>
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
            Yorumlar ({comments.length})
          </div>
        </div>
        
        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading">
              <span>⏳</span> Yorumlar yükleniyor...
            </div>
          ) : comments.length === 0 ? (
            <div className="admin-empty">
              <span>💬</span>
              <h3>Henüz yorum yok</h3>
              <p>Kullanıcılar blog yazılarınıza yorum yaptığında burada görünecek.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Yazar</th>
                    <th>Yorum</th>
                    <th>Blog Yazısı</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment.id}>
                      <td>
                        <div className="comment-author">
                          <strong>{comment.name}</strong>
                          {comment.email && (
                            <div className="comment-email">{comment.email}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div 
                          className="comment-content"
                          onClick={() => handleCommentClick(comment)}
                          style={{ cursor: 'pointer' }}
                        >
                          {comment.content.length > 100 
                            ? `${comment.content.substring(0, 100)}...` 
                            : comment.content
                          }
                        </div>
                      </td>
                      <td>
                        <Link 
                          href={`/blog/${comment.slug}`}
                          className="comment-post-link"
                          target="_blank"
                        >
                          {comment.slug}
                        </Link>
                      </td>
                      <td>{formatDate(comment.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${comment.approved ? 'status-approved' : 'status-pending'}`}>
                          {comment.approved ? 'Onaylı' : 'Beklemede'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleToggleVisibility(comment.id, comment.approved)}
                            className={`admin-btn btn-sm ${comment.approved ? 'btn-warning' : 'btn-success'}`}
                            title={comment.approved ? 'Gizle' : 'Onayla'}
                          >
                            {comment.approved ? '👁️‍🗨️' : '✅'}
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="admin-btn btn-sm btn-danger"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h3>Yorum Detayları</h3>
          <button 
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="admin-sidebar-content">
          {selectedComment && (
            <CommentDetails 
              comment={selectedComment}
              onUpdate={fetchComments}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </div>

      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <style jsx>{`
        .comment-author {
          font-size: 0.9rem;
        }
        
        .comment-email {
          color: var(--admin-text-tertiary);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        
        .comment-content {
          max-width: 200px;
          line-height: 1.4;
          font-size: 0.9rem;
        }
        
        .comment-content:hover {
          background-color: var(--admin-bg-secondary);
          padding: 0.25rem;
          border-radius: 0.25rem;
        }
        
        .comment-post-link {
          color: var(--admin-primary);
          text-decoration: none;
          font-size: 0.8rem;
        }
        
        .comment-post-link:hover {
          text-decoration: underline;
        }
        
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-approved {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        
        .admin-sidebar {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          height: 100vh;
          background-color: var(--admin-bg-main);
          border-left: 1px solid var(--admin-border);
          transition: right 0.3s ease;
          z-index: 1000;
        }
        
        .admin-sidebar.open {
          right: 0;
        }
        
        .admin-sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid var(--admin-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .admin-sidebar-content {
          padding: 1rem;
          height: calc(100vh - 80px);
          overflow-y: auto;
        }
        
        .admin-sidebar-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--admin-text-secondary);
        }
        
        .admin-sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
      `}</style>
    </div>
  );
}
