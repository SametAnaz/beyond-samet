import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Firebase Client SDK konfigürasyonu
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('🔥 Firebase bağlantısı başarılı');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  process.exit(1);
}

// Posts koleksiyonunu export et
async function exportPosts() {
  try {
    console.log('📚 Posts export ediliyor...');
    
    const postsRef = collection(db, 'posts');
    const snapshot = await getDocs(postsRef);
    
    const posts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Timestamp nesnelerini string'e çevir
      const processTimestamp = (timestamp) => {
        if (!timestamp) return null;
        if (timestamp.toDate) return timestamp.toDate().toISOString();
        if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString();
        return timestamp;
      };
      
      posts.push({
        id: doc.id,
        ...data,
        createdAt: processTimestamp(data.createdAt),
        updatedAt: processTimestamp(data.updatedAt),
        publishedAt: processTimestamp(data.publishedAt),
        date: processTimestamp(data.date),
      });
    });
    
    // JSON dosyasına kaydet
    const exportsDir = path.join(process.cwd(), 'exports');
    fs.mkdirSync(exportsDir, { recursive: true });
    
    const postsFile = path.join(exportsDir, 'posts.json');
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    
    console.log(`✅ ${posts.length} post export edildi: ${postsFile}`);
    
    // İlk birkaç post'u gösterelim
    if (posts.length > 0) {
      console.log('📋 İlk post örneği:');
      console.log('  - ID:', posts[0].id);
      console.log('  - Title:', posts[0].title);
      console.log('  - Slug:', posts[0].slug);
      console.log('  - Published:', posts[0].published);
    }
    
    return posts;
  } catch (error) {
    console.error('❌ Posts export hatası:', error);
    return [];
  }
}

// Comments koleksiyonunu export et
async function exportComments() {
  try {
    console.log('💬 Comments export ediliyor...');
    
    const commentsRef = collection(db, 'comments');
    const snapshot = await getDocs(commentsRef);
    
    const comments = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Timestamp nesnelerini string'e çevir
      const processTimestamp = (timestamp) => {
        if (!timestamp) return null;
        if (timestamp.toDate) return timestamp.toDate().toISOString();
        if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString();
        return timestamp;
      };
      
      comments.push({
        id: doc.id,
        ...data,
        createdAt: processTimestamp(data.createdAt),
        updatedAt: processTimestamp(data.updatedAt),
      });
    });
    
    // JSON dosyasına kaydet
    const exportsDir = path.join(process.cwd(), 'exports');
    fs.mkdirSync(exportsDir, { recursive: true });
    
    const commentsFile = path.join(exportsDir, 'comments.json');
    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    
    console.log(`✅ ${comments.length} comment export edildi: ${commentsFile}`);
    
    // İlk birkaç comment'i gösterelim
    if (comments.length > 0) {
      console.log('📋 İlk comment örneği:');
      console.log('  - ID:', comments[0].id);
      console.log('  - Name:', comments[0].name);
      console.log('  - Slug:', comments[0].slug);
      console.log('  - Approved:', comments[0].approved);
    }
    
    return comments;
  } catch (error) {
    console.error('❌ Comments export hatası:', error);
    return [];
  }
}

// Ana export fonksiyonu
async function exportAllData() {
  try {
    console.log('🚀 Firebase veriler export ediliyor...');
    
    const posts = await exportPosts();
    const comments = await exportComments();
    
    // Özet rapor
    const summary = {
      exportDate: new Date().toISOString(),
      totalPosts: posts.length,
      totalComments: comments.length,
      postsFile: 'exports/posts.json',
      commentsFile: 'exports/comments.json',
      postsExample: posts.length > 0 ? {
        id: posts[0].id,
        title: posts[0].title,
        slug: posts[0].slug
      } : null,
      commentsExample: comments.length > 0 ? {
        id: comments[0].id,
        name: comments[0].name,
        slug: comments[0].slug
      } : null
    };
    
    const exportsDir = path.join(process.cwd(), 'exports');
    fs.mkdirSync(exportsDir, { recursive: true });
    
    const summaryFile = path.join(exportsDir, 'export-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('🎉 Export tamamlandı!');
    console.log(`📊 Özet: ${posts.length} post, ${comments.length} comment`);
    console.log(`📄 Dosyalar: exports/ klasöründe`);
    console.log(`📋 Özet dosyası: exports/export-summary.json`);
    
  } catch (error) {
    console.error('❌ Export hatası:', error);
  } finally {
    process.exit(0);
  }
}

// Script'i çalıştır
exportAllData();
