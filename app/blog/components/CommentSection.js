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

  // Yeni yorum gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'comments'), {
        name: name,
        email: email,
        content: newComment,
        slug: slug,
        createdAt: serverTimestamp()
      });
      
      setNewComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Yorum eklerken hata oluştu:', error);
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
            placeholder="E-posta (Gösterilmeyecek)"
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
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className={styles.submitButton}
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
        </button>
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