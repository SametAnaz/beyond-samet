import { initializeGalleryTable } from '../lib/mysql-gallery.js';

console.log('🚀 MySQL Gallery tablosu oluşturuluyor...');

initializeGalleryTable()
  .then(result => {
    if (result.success) {
      console.log('✅ Gallery tablosu başarıyla oluşturuldu!');
    } else {
      console.error('❌ Hata:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Script hatası:', error);
    process.exit(1);
  });
