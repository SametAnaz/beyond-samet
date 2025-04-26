#!/usr/bin/env node

/**
 * Bu script, posts/ klasöründeki tüm Markdown dosyalarını okur ve 
 * içeriğini Firebase Firestore'a aktarır.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { remark } from 'remark';
import html from 'remark-html';

// CommonJS modüllerini ESM'de kullanmak için
const require = createRequire(import.meta.url);
const matter = require('gray-matter');

// __dirname ve __filename ESM'de bulunmadığı için
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local dosyasını yükleme
dotenv.config({ path: join(dirname(__dirname), '.env.local') });

// Firebase'i başlat
import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Markdown dosyalarının bulunduğu klasör
const postsDirectory = join(dirname(__dirname), 'posts');

async function importPosts() {
  try {
    // posts/ klasöründeki tüm dosyaları oku
    const fileNames = fs.readdirSync(postsDirectory);
    
    console.log(`${fileNames.length} adet blog yazısı bulundu.`);
    
    // Her dosya için işlem yap
    for (const fileName of fileNames) {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Front matter ve içeriği ayır
      const { data, content } = matter(fileContents);
      
      // Markdown'ı HTML'e dönüştür
      const processed = await remark()
        .use(html)
        .process(content);
      const contentHtml = processed.toString();
      
      // Firebase'e ekle
      const postData = {
        title: data.title,
        date: new Date(data.date),
        author: data.author,
        excerpt: data.excerpt,
        contentHtml: contentHtml || '',  // null veya undefined olmamasını sağla
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'posts', slug), postData);
      console.log(`"${data.title}" başlıklı yazı başarıyla aktarıldı.`);
    }
    
    console.log('Tüm yazılar başarıyla Firebase\'e aktarıldı.');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

// İçe aktarma işlemini başlat
importPosts(); 