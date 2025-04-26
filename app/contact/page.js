'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Form verilerini işleme almak için bir API çağrısı yapılabilir
      // Şimdilik fake bir API çağrısı simüle edelim
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağım.',
      });
      
      // Formu sıfırla
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>İletişim</h1>
      <p className={styles.description}>
        Proje teklifleri, iş birliği fırsatları veya herhangi bir soru için benimle iletişime geçebilirsiniz.
      </p>
      
      <div className={styles.contactGrid}>
        <div className={styles.contactInfo}>
          <h2 className={styles.sectionTitle}>İletişim Bilgileri</h2>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>✉️</span>
              <a href="mailto:sametanaz.tr@gmail.com" className={styles.contactLink}>
                sametanaz.tr@gmail.com
              </a>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>🌐</span>
              <a 
                href="https://github.com/SametAnaz" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                github.com/SametAnaz
              </a>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>👨‍💼</span>
              <a 
                href="https://www.linkedin.com/in/samet-anaz-995349291/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                linkedin.com/in/samet-anaz
              </a>
            </li>
          </ul>
        </div>
        
        <div className={styles.contactForm}>
          <h2 className={styles.sectionTitle}>Mesaj Gönder</h2>
          
          {formStatus.submitted && (
            <div className={`${styles.alert} ${formStatus.success ? styles.success : styles.error}`}>
              {formStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>İsim</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Adınız Soyadınız"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>E-posta</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="ornek@mail.com"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="subject" className={styles.label}>Konu</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Mesajınızın konusu"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>Mesaj</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className={styles.textarea}
                placeholder="Mesajınızı buraya yazın..."
                rows={5}
              />
            </div>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 