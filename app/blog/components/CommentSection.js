'use client';

import { useState, useEffect } from 'react';
import styles from '../../../styles/blog/CommentSection.module.css';

export default function CommentSection({ slug }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userConsent, setUserConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?slug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        } else {
          console.error('Yorumlar yüklenirken hata:', response.statusText);
        }
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
      }
    };

    if (slug) {
      fetchComments();
    }
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userConsent) {
      setError('Lütfen kişisel verilerin işlenmesine onay verin.');
      return;
    }

    if (!name.trim() || !newComment.trim()) {
      setError('Lütfen isim ve yorum alanlarını doldurun.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/comments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          name: name.trim(),
          email: email.trim(),
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        setSuccess('Yorumunuz başarıyla gönderildi! Onaylandıktan sonra görüntülenecektir.');
        setNewComment('');
        setName('');
        setEmail('');
        setUserConsent(false);
        
        // Yorumları yeniden yükle
        const fetchResponse = await fetch(`/api/comments?slug=${slug}`);
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setComments(data.comments || []);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Yorum gönderilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      setError('Yorum gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.title}>Yorumlar ({comments.length})</h3>
      
      {/* Yorum Formu */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">İsim *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız"
            required
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">E-posta (isteğe bağlı)</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="comment">Yorum *</label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            rows="4"
            required
            className={styles.textarea}
          />
        </div>
        
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={userConsent}
              onChange={(e) => setUserConsent(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Kişisel verilerimin bu yorum sistemi için işlenmesine onay veriyorum.
            </span>
          </label>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <button 
          type="submit" 
          disabled={submitting || !userConsent}
          className={styles.submitButton}
        >
          {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
        </button>
      </form>
      
      {/* Yorumlar Listesi */}
      <div className={styles.commentsContainer}>
        {comments.length === 0 ? (
          <p className={styles.noComments}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>{comment.name}</span>
                <span className={styles.commentDate}>
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <div className={styles.commentContent}>
                {comment.comment}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
