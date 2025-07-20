import { config } from 'dotenv';
import { list } from "@vercel/blob";
import { addImageMetadata } from '../lib/mysql-gallery.js';

// Load environment variables
config({ path: '.env.local' });

// Mevcut blob storage'daki resimleri MySQL'e migrate et
async function migrateExistingImages() {
  try {
    console.log('🔄 Mevcut resimler MySQL\'e migrate ediliyor...');
    
    // Blob storage'dan tüm resimleri listele
    const { blobs } = await list({
      prefix: 'beyond-samet-gallery/',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    // Sadece resim dosyalarını filtrele
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const images = blobs.filter(blob => 
      imageExtensions.some(ext => blob.pathname.toLowerCase().endsWith(ext))
    );
    
    console.log(`📷 ${images.length} resim bulundu`);
    
    // Her resim için metadata oluştur ve MySQL'e ekle
    for (const blob of images) {
      const fileName = blob.pathname.split('/').pop();
      const title = fileName.split('.')[0];
      
      const imageMetadata = {
        url: blob.url,
        path: blob.pathname,
        fileName: fileName,
        title: title,
        description: '',
        order: 999,
        size: blob.size,
        type: `image/${fileName.split('.').pop().toLowerCase()}`,
        originalName: fileName
      };
      
      const result = await addImageMetadata(imageMetadata);
      
      if (result.success) {
        console.log(`✅ ${fileName} başarıyla migrate edildi (ID: ${result.id})`);
      } else {
        console.log(`❌ ${fileName} migrate edilemedi:`, result.error);
      }
    }
    
    console.log('🎉 Migration tamamlandı!');
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
  }
}

// Script'i çalıştır
migrateExistingImages();
