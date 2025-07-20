import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { pool } from '../lib/mysql-posts.js';

config({ path: '.env.local' });

// Markdown dosyasından front matter ve content ayırma
function parseMarkdownFile(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { frontMatter: {}, content: content };
  }
  
  const frontMatterContent = match[1];
  const bodyContent = match[2];
  
  // Front matter'ı parse et
  const frontMatter = {};
  frontMatterContent.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontMatter[key] = value;
    }
  });
  
  return { frontMatter, content: bodyContent.trim() };
}

// Post içeriklerini güncelle
async function updatePostContents() {
  try {
    console.log('📄 Markdown dosyalarından içerikler güncelleniyor...');
    
    const postsDir = path.join(process.cwd(), 'posts');
    const files = fs.readdirSync(postsDir);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      try {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { frontMatter, content } = parseMarkdownFile(fileContent);
        
        const slug = frontMatter.slug || file.replace('.md', '');
        
        console.log(`🔄 ${slug} güncelleniyor...`);
        
        // MySQL'de bu slug'a sahip post'u güncelle
        const connection = await pool.getConnection();
        
        const [result] = await connection.execute(`
          UPDATE posts 
          SET 
            content = ?,
            title = COALESCE(?, title),
            excerpt = COALESCE(?, excerpt),
            author = COALESCE(?, author),
            published = 1,
            updatedAt = ?
          WHERE slug = ?
        `, [
          content,
          frontMatter.title || null,
          frontMatter.excerpt || null,
          frontMatter.author || null,
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          slug
        ]);
        
        connection.release();
        
        if (result.affectedRows > 0) {
          console.log(`✅ ${slug} başarıyla güncellendi`);
          updatedCount++;
        } else {
          console.log(`❌ ${slug} için post bulunamadı`);
          errorCount++;
        }
        
      } catch (fileError) {
        console.error(`❌ ${file} işlenirken hata:`, fileError.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Güncelleme tamamlandı!`);
    console.log(`📊 ${updatedCount} başarılı, ${errorCount} hatalı`);
    
  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit(0);
  }
}

// Script'i çalıştır
updatePostContents();
