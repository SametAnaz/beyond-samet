import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { initializePostsTable, initializeCommentsTable, addPost, addComment } from '../lib/mysql-posts.js';

config({ path: '.env.local' });

// Posts'ları MySQL'e import et
async function importPosts() {
  try {
    const postsFile = path.join(process.cwd(), 'exports', 'posts.json');
    if (!fs.existsSync(postsFile)) {
      console.log('❌ posts.json dosyası bulunamadı');
      return 0;
    }
    
    const posts = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
    console.log(`📚 ${posts.length} post import ediliyor...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const post of posts) {
      // Firebase'den gelen verileri MySQL formatına çevir
      const postData = {
        id: post.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: post.title || 'Başlıksız',
        content: post.content || '',
        excerpt: post.excerpt || post.summary || '',
        slug: post.slug || post.id || post.title?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        published: post.published || false,
        featured: post.featured || false,
        author: post.author || 'Samet Anaz',
        tags: post.tags || [],
        metaDescription: post.metaDescription || post.description || '',
        readingTime: post.readingTime || 0,
        views: post.views || 0,
        createdAt: post.createdAt || post.date || new Date().toISOString(),
        updatedAt: post.updatedAt || post.createdAt || post.date || new Date().toISOString()
      };
      
      const result = await addPost(postData);
      
      if (result.success) {
        console.log(`✅ ${postData.title} başarıyla import edildi (ID: ${postData.id})`);
        successCount++;
      } else {
        console.log(`❌ ${postData.title} import edilemedi:`, result.error);
        errorCount++;
      }
    }
    
    console.log(`📊 Posts import özeti: ${successCount} başarılı, ${errorCount} hatalı`);
    return successCount;
  } catch (error) {
    console.error('❌ Posts import hatası:', error);
    return 0;
  }
}

// Comments'leri MySQL'e import et
async function importComments() {
  try {
    const commentsFile = path.join(process.cwd(), 'exports', 'comments.json');
    if (!fs.existsSync(commentsFile)) {
      console.log('❌ comments.json dosyası bulunamadı');
      return 0;
    }
    
    const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
    console.log(`💬 ${comments.length} comment import ediliyor...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const comment of comments) {
      // Firebase'den gelen verileri MySQL formatına çevir
      const commentData = {
        id: comment.id || `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: comment.name || 'Anonim',
        email: comment.email || null,
        content: comment.content || comment.message || '',
        slug: comment.slug || comment.postSlug || '',
        approved: comment.approved !== false, // Default true eğer tanımlanmamışsa
        parentId: comment.parentId || comment.replyTo || null,
        ipAddress: comment.ipAddress || null,
        userAgent: comment.userAgent || null,
        createdAt: comment.createdAt || new Date().toISOString(),
        updatedAt: comment.updatedAt || comment.createdAt || new Date().toISOString()
      };
      
      const result = await addComment(commentData);
      
      if (result.success) {
        console.log(`✅ ${commentData.name} yorumu başarıyla import edildi (ID: ${commentData.id})`);
        successCount++;
      } else {
        console.log(`❌ ${commentData.name} yorumu import edilemedi:`, result.error);
        errorCount++;
      }
    }
    
    console.log(`📊 Comments import özeti: ${successCount} başarılı, ${errorCount} hatalı`);
    return successCount;
  } catch (error) {
    console.error('❌ Comments import hatası:', error);
    return 0;
  }
}

// Ana import fonksiyonu
async function importAllData() {
  try {
    console.log('🚀 MySQL tabloları oluşturuluyor...');
    
    const postsTableResult = await initializePostsTable();
    const commentsTableResult = await initializeCommentsTable();
    
    if (!postsTableResult.success || !commentsTableResult.success) {
      console.error('❌ Tablolar oluşturulamadı, import iptal ediliyor');
      return;
    }
    
    console.log('📥 Veriler MySQL\'e import ediliyor...');
    
    const importedPosts = await importPosts();
    const importedComments = await importComments();
    
    // Son özet
    const summary = {
      importDate: new Date().toISOString(),
      importedPosts,
      importedComments,
      totalImported: importedPosts + importedComments
    };
    
    // Import özetini kaydet
    const summaryFile = path.join(process.cwd(), 'exports', 'import-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log('🎉 Import tamamlandı!');
    console.log(`📊 Özet: ${importedPosts} post, ${importedComments} comment MySQL\'e aktarıldı`);
    console.log(`📋 Import özeti: exports/import-summary.json`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    process.exit(0);
  }
}

// Script'i çalıştır
importAllData();
