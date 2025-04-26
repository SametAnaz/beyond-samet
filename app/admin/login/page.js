'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/admin/page.module.css';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'beyond2025';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: ''
  });
  
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error when user types
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = {
      username: '',
      password: ''
    };
    let isValid = true;

    // Validate username
    if (!formData.username.trim()) {
      errors.username = 'Kullanıcı adı gereklidir';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Şifre gereklidir';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Authentication check
      if (formData.username === ADMIN_USERNAME && formData.password === ADMIN_PASSWORD) {
        // Save auth data to localStorage
        const authData = {
          isAuthenticated: true,
          timestamp: Date.now()
        };
        localStorage.setItem('adminAuth', JSON.stringify(authData));
        
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError('Geçersiz kullanıcı adı veya şifre');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h1 className={styles.title}>Admin Girişi</h1>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.username ? styles.inputError : ''}`}
              disabled={loading}
              autoComplete="username"
            />
            {fieldErrors.username && <div className={styles.fieldError}>{fieldErrors.username}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
              disabled={loading}
              autoComplete="current-password"
            />
            {fieldErrors.password && <div className={styles.fieldError}>{fieldErrors.password}</div>}
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
} 