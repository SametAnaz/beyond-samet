// Firebase blog posts servisi
import { db } from './firebase';
import { 
  collection, getDocs, getDoc, doc, 
  query, orderBy, where, limit, 
  serverTimestamp, addDoc, updateDoc, deleteDoc, setDoc, startAfter, endBefore, limitToLast
} from 'firebase/firestore';

// Blog koleksiyonu referansı
const POSTS_COLLECTION = 'posts';
const postsRef = collection(db, POSTS_COLLECTION);

/**
 * Toplam blog yazısı sayısını döndürür
 */
export async function getTotalPostsCount() {
  try {
    const querySnapshot = await getDocs(postsRef);
    return querySnapshot.size;
  } catch (error) {
    console.error("Firebase-posts: Toplam blog yazısı sayısı alınırken hata:", error);
    return 0;
  }
}

/**
 * Sayfalandırma ile blog yazılarını getirir
 * @param {number} page - Sayfa numarası
 * @param {number} itemsPerPage - Sayfa başına gösterilecek yazı sayısı
 */
export async function getPaginatedPosts(page = 1, itemsPerPage = 5) {
  try {
    console.log(`Firebase-posts: Sayfa ${page}, her sayfada ${itemsPerPage} yazı olacak şekilde blog yazıları yükleniyor...`);
    
    // Tüm verileri al ve ardından JavaScript'te sayfalandırma uygula
    // (Firebase'de sıralama ve sayfalandırma daha karmaşık olduğundan)
    const querySnapshot = await getDocs(postsRef);
    console.log(`Firebase-posts: ${querySnapshot.size} blog yazısı bulundu`);
    
    if (querySnapshot.empty) {
      console.log("Firebase-posts: Posts koleksiyonu boş");
      return { posts: [], totalPosts: 0 };
    }
    
    const allPosts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Dönüştürülmüş tarih değerleri
      let createdAtDate, dateDate;
      
      try {
        createdAtDate = data.createdAt?.toDate?.() || null;
      } catch (err) {
        console.error(`Firebase-posts: createdAt dönüştürme hatası: ${err.message}`);
        createdAtDate = null;
      }
      
      try {
        dateDate = data.date?.toDate?.() || null;
      } catch (err) {
        console.error(`Firebase-posts: date dönüştürme hatası: ${err.message}`);
        dateDate = null;
      }
      
      return {
        slug: doc.id,
        ...data,
        createdAt: createdAtDate || dateDate || new Date(),
        date: dateDate || createdAtDate || new Date()
      };
    });
    
    // Manuel olarak tarihe göre sırala
    const sortedPosts = allPosts.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0);
      return dateB - dateA;
    });
    
    // Toplam yazı sayısı
    const totalPosts = sortedPosts.length;
    
    // Sayfalandırma
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedPosts = sortedPosts.slice(start, end);
    
    return {
      posts: paginatedPosts,
      totalPosts
    };
  } catch (error) {
    console.error("Firebase-posts: Blog yazıları alınırken hata:", error);
    return { posts: [], totalPosts: 0 };
  }
}

/**
 * Tüm blog yazılarını tarihe göre sıralayarak getirir
 * @deprecated - Yerine getPaginatedPosts kullanın
 */
export async function getSortedPostsData() {
  try {
    console.log("Firebase-posts: Tüm blog yazılarını yüklemeye başlıyor...");
    
    // Doğrudan belgeleri al
    const querySnapshot = await getDocs(postsRef);
    console.log(`Firebase-posts: ${querySnapshot.size} blog yazısı bulundu`);
    
    if (querySnapshot.empty) {
      console.log("Firebase-posts: Posts koleksiyonu boş");
      return [];
    }
    
    const allPosts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Firebase-posts: Blog yazısı ID=${doc.id}, data:`, data);
      
      // Dönüştürülmüş tarih değerleri
      let createdAtDate, dateDate;
      
      try {
        createdAtDate = data.createdAt?.toDate?.() || null;
      } catch (err) {
        console.error(`Firebase-posts: createdAt dönüştürme hatası: ${err.message}`);
        createdAtDate = null;
      }
      
      try {
        dateDate = data.date?.toDate?.() || null;
      } catch (err) {
        console.error(`Firebase-posts: date dönüştürme hatası: ${err.message}`);
        dateDate = null;
      }
      
      return {
        slug: doc.id,
        ...data,
        createdAt: createdAtDate || dateDate || new Date(),
        date: dateDate || createdAtDate || new Date()
      };
    });
    
    // Manuel olarak tarihe göre sırala
    const sortedPosts = allPosts.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0);
      return dateB - dateA;
    });
    
    return sortedPosts;
  } catch (error) {
    console.error("Firebase-posts: Blog yazıları alınırken hata:", error);
    return [];
  }
}

/**
 * Tüm blog yazılarının slug değerlerini döndürür
 */
export async function getAllPostSlugs() {
  try {
    console.log("Firebase-posts: Tüm slugları getirme başladı");
    const querySnapshot = await getDocs(postsRef);
    console.log(`Firebase-posts: ${querySnapshot.size} slug bulundu`);
    
    return querySnapshot.docs.map(doc => ({
      slug: doc.id
    }));
  } catch (error) {
    console.error("Firebase-posts: Blog slugları alınırken hata:", error);
    return [];
  }
}

/**
 * Verilen slug'a göre blog yazısını getirir
 */
export async function getPostData(slug) {
  try {
    console.log(`Firebase-posts: "${slug}" için blog yazısı getiriliyor`);
    
    if (!slug) {
      console.error("Firebase-posts: Geçersiz slug değeri");
      throw new Error("Slug değeri geçersiz");
    }
    
    const docRef = doc(db, POSTS_COLLECTION, slug);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`Firebase-posts: "${slug}" için blog yazısı bulunamadı`);
      throw new Error("Blog yazısı bulunamadı");
    }
    
    const postData = docSnap.data();
    console.log(`Firebase-posts: "${slug}" için blog yazısı yüklendi:`, postData);
    
    // contentHtml değeri string olarak doğru formatta olduğundan emin olalım
    // Firebase'den gelen veri null, undefined ya da başka bir formatta olabilir
    const safeContentHtml = typeof postData.contentHtml === 'string' 
      ? postData.contentHtml 
      : '';
    
    const content = typeof postData.content === 'string'
      ? postData.content
      : '';
    
    // Dönüştürülmüş tarih değerleri
    let createdAtDate, dateDate;
    
    try {
      createdAtDate = postData.createdAt?.toDate?.() || null;
    } catch (err) {
      console.error(`Firebase-posts: createdAt dönüştürme hatası: ${err.message}`);
      createdAtDate = null;
    }
    
    try {
      dateDate = postData.date?.toDate?.() || null;
    } catch (err) {
      console.error(`Firebase-posts: date dönüştürme hatası: ${err.message}`);
      dateDate = null;
    }
    
    return {
      slug,
      ...postData,
      contentHtml: safeContentHtml,
      content: content,
      date: dateDate || createdAtDate || new Date(),
      createdAt: createdAtDate || dateDate || new Date()
    };
  } catch (error) {
    console.error(`Firebase-posts: "${slug}" için blog yazısı alınırken hata:`, error);
    throw error;
  }
}

/**
 * Yeni blog yazısı ekler
 */
export async function addPost(postData) {
  try {
    console.log("Firebase-posts: Yeni blog yazısı ekleniyor:", postData);
    const { slug, ...restData } = postData;
    
    // Eğer slug verilmişse, özel ID ile oluştur
    if (slug) {
      const docRef = doc(db, POSTS_COLLECTION, slug);
      await setDoc(docRef, {
        ...restData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Firebase-posts: Blog yazısı "${slug}" ID'si ile eklendi`);
      return slug;
    } 
    // Slug verilmemişse, otomatik ID oluştur
    else {
      const docRef = await addDoc(postsRef, {
        ...restData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Firebase-posts: Blog yazısı "${docRef.id}" ID'si ile eklendi`);
      return docRef.id;
    }
  } catch (error) {
    console.error("Firebase-posts: Blog yazısı eklenirken hata:", error);
    throw error;
  }
}

/**
 * Blog yazısını günceller
 */
export async function updatePost(slug, postData) {
  try {
    console.log(`Firebase-posts: "${slug}" için blog yazısı güncelleniyor:`, postData);
    const docRef = doc(db, POSTS_COLLECTION, slug);
    await updateDoc(docRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
    console.log(`Firebase-posts: "${slug}" için blog yazısı güncellendi`);
    return true;
  } catch (error) {
    console.error(`Firebase-posts: "${slug}" için blog yazısı güncellenirken hata:`, error);
    throw error;
  }
}

/**
 * Blog yazısını siler
 */
export async function deletePost(slug) {
  try {
    console.log(`Firebase-posts: "${slug}" için blog yazısı siliniyor`);
    const docRef = doc(db, POSTS_COLLECTION, slug);
    await deleteDoc(docRef);
    console.log(`Firebase-posts: "${slug}" için blog yazısı silindi`);
    return true;
  } catch (error) {
    console.error(`Firebase-posts: "${slug}" için blog yazısı silinirken hata:`, error);
    throw error;
  }
} 