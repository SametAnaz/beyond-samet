// Firebase Authentication fonksiyonları
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from './firebase';

// Firebase Auth nesnesini al
const auth = getAuth(app);

/**
 * E-posta ve şifre ile giriş yapar
 * @param {string} email Kullanıcı e-posta adresi
 * @param {string} password Kullanıcı şifresi
 * @returns {Promise} Giriş işlemi sonucu
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Giriş yaparken hata:', error);
    return { user: null, error: error.message };
  }
};

/**
 * Kullanıcı çıkışı yapar
 * @returns {Promise} Çıkış işlemi sonucu
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error) {
    console.error('Çıkış yaparken hata:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mevcut oturum açmış kullanıcıyı döndürür
 * @returns {Object|null} Oturum açmış kullanıcı veya null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Kullanıcının oturum durumunu takip eder
 * @param {Function} callback Kullanıcı değiştiğinde çağrılacak fonksiyon
 * @returns {Function} Aboneliği sonlandırmak için fonksiyon
 */
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};

export { auth }; 