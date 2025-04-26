// Firebase blog posts servisi
import { db } from './firebase';
import { 
  collection, getDocs, getDoc, doc, 
  query, orderBy, where, limit, 
  serverTimestamp, addDoc, updateDoc, deleteDoc, setDoc
} from 'firebase/firestore';

// Blog koleksiyonu referansı
const POSTS_COLLECTION = 'posts';
const postsRef = collection(db, POSTS_COLLECTION);

/**
 * Tüm blog yazılarını tarihe göre sıralayarak getirir
 */
export async function getSortedPostsData() {
  try {
    const q = query(postsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const allPosts = querySnapshot.docs.map(doc => ({
      slug: doc.id,
      ...doc.data(),
      // Firestore Timestamp'ı JavaScript Date'e çevirme
      date: doc.data().date?.toDate?.() || new Date(),
    }));
    
    return allPosts;
  } catch (error) {
    console.error("Blog yazıları alınırken hata:", error);
    return [];
  }
}

/**
 * Tüm blog yazılarının slug değerlerini döndürür
 */
export async function getAllPostSlugs() {
  try {
    const querySnapshot = await getDocs(postsRef);
    return querySnapshot.docs.map(doc => ({
      slug: doc.id
    }));
  } catch (error) {
    console.error("Blog slugları alınırken hata:", error);
    return [];
  }
}

/**
 * Verilen slug'a göre blog yazısını getirir
 */
export async function getPostData(slug) {
  try {
    if (!slug) {
      throw new Error("Slug değeri geçersiz");
    }
    
    const docRef = doc(db, POSTS_COLLECTION, slug);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Blog yazısı bulunamadı");
    }
    
    const postData = docSnap.data();
    
    // contentHtml değeri string olarak doğru formatta olduğundan emin olalım
    // Firebase'den gelen veri null, undefined ya da başka bir formatta olabilir
    const safeContentHtml = typeof postData.contentHtml === 'string' 
      ? postData.contentHtml 
      : '';
    
    return {
      slug,
      ...postData,
      contentHtml: safeContentHtml,
      // Firestore Timestamp'ı JavaScript Date'e çevirme
      date: postData.date?.toDate?.() || new Date()
    };
  } catch (error) {
    console.error(`"${slug}" için blog yazısı alınırken hata:`, error);
    throw error;
  }
}

/**
 * Yeni blog yazısı ekler
 */
export async function addPost(postData) {
  try {
    const { slug, ...restData } = postData;
    
    // Eğer slug verilmişse, özel ID ile oluştur
    if (slug) {
      const docRef = doc(db, POSTS_COLLECTION, slug);
      await setDoc(docRef, {
        ...restData,
        date: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return slug;
    } 
    // Slug verilmemişse, otomatik ID oluştur
    else {
      const docRef = await addDoc(postsRef, {
        ...restData,
        date: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("Blog yazısı eklenirken hata:", error);
    throw error;
  }
}

/**
 * Blog yazısını günceller
 */
export async function updatePost(slug, postData) {
  try {
    const docRef = doc(db, POSTS_COLLECTION, slug);
    await updateDoc(docRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error(`"${slug}" için blog yazısı güncellenirken hata:`, error);
    throw error;
  }
}

/**
 * Blog yazısını siler
 */
export async function deletePost(slug) {
  try {
    const docRef = doc(db, POSTS_COLLECTION, slug);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`"${slug}" için blog yazısı silinirken hata:`, error);
    throw error;
  }
} 