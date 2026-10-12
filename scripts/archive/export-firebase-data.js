import { config } from 'dotenv';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Firebase Admin SDK konfigürasyonu
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase bağlantısı başarılı');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  process.exit(1);
}

const db = getFirestore(app);

// Posts koleksiyonunu export et
async function exportPosts() {
  try {
    console.log('📚 Posts export ediliyor...');
    
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.get();
    
    const posts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        // Timestamp'leri string'e çevir
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : data.publishedAt,
      });
    });
    
    // JSON dosyasına kaydet
    const exportsDir = path.join(process.cwd(), 'exports');
    fs.mkdirSync(exportsDir, { recursive: true });
    
    const postsFile = path.join(exportsDir, 'posts.json');
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    
    console.log(`✅ ${posts.length} post export edildi: ${postsFile}`);
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
    
    const commentsRef = db.collection('comments');
    const snapshot = await commentsRef.get();
    
    const comments = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        // Timestamp'leri string'e çevir
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      });
    });
    
    // JSON dosyasına kaydet
    const exportsDir = path.join(process.cwd(), 'exports');
    fs.mkdirSync(exportsDir, { recursive: true });
    
    const commentsFile = path.join(exportsDir, 'comments.json');
    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
    
    console.log(`✅ ${comments.length} comment export edildi: ${commentsFile}`);
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
      commentsFile: 'exports/comments.json'
    };
    
    const summaryFile = path.join(process.cwd(), 'exports', 'export-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('🎉 Export tamamlandı!');
    console.log(`📊 Özet: ${posts.length} post, ${comments.length} comment`);
    console.log(`📄 Dosyalar: exports/ klasöründe`);
    
  } catch (error) {
    console.error('❌ Export hatası:', error);
  } finally {
    process.exit(0);
  }
}

// Script'i çalıştır
exportAllData();
