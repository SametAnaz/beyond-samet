'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
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
        // Şu an için orderBy'ı kaldırıyoruz, daha sonra indeks oluşturulunca eklenebilir
        const q = query(
          collection(db, 'comments'),
          where('slug', '==', slug)
        );
        const querySnapshot = await getDocs(q);
        
        const fetchedComments = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only display non-hidden comments to regular users
          if (!data.hidden) {
            fetchedComments.push({
              id: doc.id,
              ...data
            });
          }
        });
        
        // Client-side tarihe göre sıralama
        fetchedComments.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.seconds - a.createdAt.seconds;
          }
          return 0;
        });
        
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [slug]);

  const getUserAgent = () => {
    return {
      browser: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !name.trim()) {
      setError('İsim ve yorum alanları zorunludur.');
      return;
    }
    
    if (!userConsent) {
      setError('Devam etmek için şartları kabul etmeniz gerekmektedir.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // IP adresini al
      let ipData = { ip: 'unknown' };
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        ipData = await ipResponse.json();
      } catch (error) {
        console.error('IP adresi alınamadı:', error);
      }

      const userAgentData = getUserAgent();
      
      // Server API'sini kullan (Doğrudan client tarafında yazmak yerine)
      const response = await fetch('/api/comments/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          content: newComment.trim(),
          slug: slug,
          ipAddress: ipData.ip,
          userAgent: userAgentData,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yorum eklenirken bir hata oluştu');
      }

      setNewComment('');
      setName('');
      setEmail('');
      setUserConsent(false);
      setSuccess('Yorumunuz başarıyla gönderildi. İncelendikten sonra yayınlanacaktır.');
      
      // Yeni yorumu ekle (normalde backend işlemi olmalı)
      setTimeout(() => {
        window.location.reload(); // Sayfayı yenile
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.message || 'Yorumunuz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clear error when user starts typing
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.commentTitle}>Yorumlar ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>İsim *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleInputChange(setName)}
              placeholder="İsminiz"
              required
              disabled={submitting}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>E-posta (opsiyonel)</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              placeholder="E-posta adresiniz"
              disabled={submitting}
              className={styles.input}
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="comment" className={styles.label}>Yorum *</label>
          <textarea
            id="comment"
            value={newComment}
            onChange={handleInputChange(setNewComment)}
            placeholder="Düşüncelerinizi paylaşın..."
            required
            disabled={submitting}
            className={styles.textarea}
            rows={4}
          />
        </div>
        
        <div className={styles.formGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="consent"
              checked={userConsent}
              onChange={(e) => {
                setUserConsent(e.target.checked);
                if (error) setError('');
              }}
              disabled={submitting}
              className={styles.checkbox}
            />
            <label htmlFor="consent" className={styles.checkboxLabel}>
              Yorum göndererek, içeriğin kontrol edildikten sonra uygun görülmesi halinde yayınlanmasını kabul etmiş oluyorsunuz.
            </label>
          </div>
        </div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        
        <button
          type="submit"
          disabled={submitting}
          className={styles.submitButton}
        >
          {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
        </button>
      </form>
      
      <div className={styles.commentList}>
        {comments.length === 0 ? (
          <p className={styles.noComments}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <h4 className={styles.commentAuthor}>{comment.name}</h4>
                <span className={styles.commentDate}>
                  {comment.createdAt && new Date(comment.createdAt.seconds * 1000).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 