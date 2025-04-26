'use client';

import { useState } from 'react';
import styles from '../../../styles/admin/comment-details.module.css';

export default function CommentDetails({ comment, onClose }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!comment) return null;
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Bilinmiyor';
    
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Tarih formatlanırken hata:', error);
      return 'Geçersiz Tarih';
    }
  };
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Yorum Detayları</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Temel Bilgiler</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>İsim:</span>
              <span className={styles.value}>{comment.name}</span>
            </div>
            {comment.email && (
              <div className={styles.detailRow}>
                <span className={styles.label}>E-posta:</span>
                <span className={styles.value}>
                  <a href={`mailto:${comment.email}`}>{comment.email}</a>
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.label}>Tarih:</span>
              <span className={styles.value}>{formatDate(comment.createdAt)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Blog Yazısı:</span>
              <span className={styles.value}>{comment.slug}</span>
            </div>
          </div>
          
          <div className={styles.section}>
            <h3>Yorum İçeriği</h3>
            <div className={styles.commentContent}>
              {comment.content}
            </div>
          </div>
          
          <div className={styles.section}>
            <h3>Konum Bilgileri</h3>
            {comment.location ? (
              <>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Ülke:</span>
                  <span className={styles.value}>{comment.location.country || 'Bilinmiyor'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Şehir:</span>
                  <span className={styles.value}>{comment.location.city || 'Bilinmiyor'}</span>
                </div>
                {comment.location.region && (
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Bölge:</span>
                    <span className={styles.value}>{comment.location.region}</span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.detailRow}>
                <span className={styles.value}>Konum bilgisi mevcut değil</span>
              </div>
            )}
          </div>
          
          <div className={styles.section}>
            <button className={styles.expandButton} onClick={toggleExpand}>
              {expanded ? 'Teknik Detayları Gizle' : 'Teknik Detayları Göster'}
            </button>
            
            {expanded && (
              <div className={styles.technicalDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>IP Adresi:</span>
                  <span className={styles.value}>{comment.ipAddress || 'Bilinmiyor'}</span>
                </div>
                
                {comment.userAgent && (
                  <>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Tarayıcı:</span>
                      <span className={styles.value}>{comment.userAgent.browser || 'Bilinmiyor'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Platform:</span>
                      <span className={styles.value}>{comment.userAgent.platform || 'Bilinmiyor'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Dil:</span>
                      <span className={styles.value}>{comment.userAgent.language || 'Bilinmiyor'}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 