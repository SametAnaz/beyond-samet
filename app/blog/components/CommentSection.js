'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import styles from './CommentSection.module.css';

export default function CommentSection({ slug }) {
  const { resolvedTheme } = useTheme();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userConsent, setUserConsent] = useState(false);

  // Yorumları veritabanından çek
  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    
    // İndeks oluşturulana kadar geçici çözüm: sıralama işlemini kaldırıyoruz
    const q = query(
      commentsRef,
      where('slug', '==', slug)
      // orderBy('createdAt', 'desc') - indeks oluşturulana kadar bunu kaldırıyoruz
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Yorumları client tarafında sıralayalım
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        // Eğer timestamp varsa, ona göre sırala
        if (a.createdAt && b.createdAt) {
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        // createdAt yoksa, varsayılan olarak son eklenen en üstte olsun
        return -1;
      });
      
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [slug]);

  // Kullanıcı cihaz bilgisi
  const getUserAgent = () => {
    return navigator.userAgent || 'Unknown';
  };

  // Yeni yorum gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !name.trim() || !userConsent) return;
    
    setIsSubmitting(true);
    
    try {
      // Kullanıcının IP adresini almak için basit bir API çağrısı
      // Not: Gerçek uygulamada IP bilgisi server-side tarafında alınmalı
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      await addDoc(collection(db, 'comments'), {
        name: name,
        email: email || null, // E-posta varsa kaydet, yoksa null olarak kaydet
        content: newComment,
        slug: slug,
        createdAt: serverTimestamp(),
        ipAddress: ipData.ip || 'Unknown',
        userAgent: getUserAgent(),
        consentGiven: true
      });
      
      setNewComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Yorum eklerken hata oluştu:', error);
      // IP bilgisi alınamazsa da yorumu kaydet
      try {
        await addDoc(collection(db, 'comments'), {
          name: name,
          email: email || null, // E-posta varsa kaydet, yoksa null olarak kaydet
          content: newComment,
          slug: slug,
          createdAt: serverTimestamp(),
          ipAddress: 'Not available',
          userAgent: getUserAgent(),
          consentGiven: true
        });
        
        setNewComment('');
      } catch (innerError) {
        console.error('Tekrar deneme başarısız:', innerError);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.comments}>
      <h2 className={styles.title}>Yorumlar</h2>
      
      {/* Yorum formu */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Adınız"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="email"
            placeholder="E-posta (Opsiyonel)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>
        <textarea
          placeholder="Yorumunuzu yazın..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
          className={styles.textarea}
        />
        <div className={styles.consentBox}>
          <input
            type="checkbox"
            id="consent"
            checked={userConsent}
            onChange={(e) => setUserConsent(e.target.checked)}
            required
          />
          <label htmlFor="consent">
            Yorum yaparak adımın ve yorumumun herkese açık şekilde paylaşılmasına izin veriyorum.
          </label>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting || !userConsent} 
          className={styles.submitButton}
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
        </button>
        <p className={styles.disclaimer}>
          * Bilgileriniz sadece yorum sisteminin yönetimi ve spam önleme amaçlı kullanılmaktadır. Bu bilgiler 3. taraflarla paylaşılmaz ve kullanıcı tarafından talep edildiğinde silinir.
        </p>
      </form>
      
      {/* Yorumları listele */}
      <div className={styles.commentsList}>
        {comments.length === 0 ? (
          <p className={styles.noComments}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <h4 className={styles.commentAuthor}>{comment.name}</h4>
                <span className={styles.commentDate}>
                  {comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleDateString('tr-TR') : 'Şimdi'}
                </span>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
} 