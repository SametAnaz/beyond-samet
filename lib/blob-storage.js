import { put, list, del } from "@vercel/blob";
import { 
  addImageMetadata, 
  getAllImageMetadata, 
  deleteImageMetadata, 
  findImageByUrl 
} from './mysql-gallery';

// Vercel Blob Storage'a resim yükleme
export async function uploadImageToBlob(file, fileName, metadata = {}) {
  try {
    // beyond-samet-gallery klasöründe dosyayı sakla
    const blobPath = `beyond-samet-gallery/${fileName}`;
    
    const { url } = await put(blobPath, file, { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN 
    });
    
    // MySQL'e metadata ekle (hata olursa devam et)
    try {
      const imageMetadata = {
        url,
        path: blobPath,
        fileName,
        title: metadata.title || fileName.split('.')[0],
        description: metadata.description || '',
        order: metadata.order || 999,
        size: file.size,
        type: file.type,
        originalName: metadata.originalName || file.name
      };
      
      const mysqlResult = await addImageMetadata(imageMetadata);
      
      return { 
        success: true, 
        url, 
        path: blobPath, 
        metadataId: mysqlResult.id 
      };
    } catch (mysqlError) {
      console.warn('MySQL metadata save failed, but blob upload succeeded:', mysqlError);
      return { 
        success: true, 
        url, 
        path: blobPath, 
        metadataId: null 
      };
    }
    
  } catch (error) {
    console.error('Blob storage upload error:', error);
    return { success: false, error: error.message };
  }
}

// Galeri klasöründeki tüm resimleri listele (MySQL'den metadata ile)
export async function listGalleryImages() {
  try {
    // MySQL'den metadata'ları al
    const metadataResult = await getAllImageMetadata();
    
    if (metadataResult.success && metadataResult.images.length > 0) {
      return { success: true, images: metadataResult.images };
    } else {
      console.log('MySQL metadata bulunamadı, blob storage\'dan listeleniyor...');
      // Fallback: Blob storage'dan direkt listele
      const { blobs } = await list({
        prefix: 'beyond-samet-gallery/',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      
      // Sadece resim dosyalarını filtrele
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const images = blobs.filter(blob => 
        imageExtensions.some(ext => blob.pathname.toLowerCase().endsWith(ext))
      ).map(blob => ({
        id: blob.pathname,
        url: blob.url,
        title: blob.pathname.split('/').pop().split('.')[0], // Dosya adından başlık oluştur
        description: '',
        fileName: blob.pathname.split('/').pop(),
        uploadedAt: blob.uploadedAt,
        createdAt: blob.uploadedAt,
        size: blob.size,
        order: 999
      }));
      
      return { success: true, images };
    }
  } catch (error) {
    console.error('Blob storage list error:', error);
    
    // Eğer her şey başarısız olursa boş liste döndür
    return { success: true, images: [] };
  }
}

// Blob storage'dan resim silme (MySQL metadata'sı ile birlikte)
export async function deleteImageFromBlob(url) {
  try {
    // Önce MySQL'den metadata'yı bul ve sil
    const findResult = await findImageByUrl(url);
    if (findResult.success) {
      await deleteImageMetadata(findResult.image.id);
    }
    
    // Blob storage'dan sil
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return { success: true };
  } catch (error) {
    console.error('Blob storage delete error:', error);
    return { success: false, error: error.message };
  }
}

// Dosya adını güvenli hale getirme
export function sanitizeFileName(fileName) {
  // Türkçe karakterleri değiştir ve güvenli hale getir
  const turkishChars = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };
  
  let sanitized = fileName;
  Object.keys(turkishChars).forEach(char => {
    sanitized = sanitized.replace(new RegExp(char, 'g'), turkishChars[char]);
  });
  
  // Özel karakterleri kaldır, sadece harf, rakam, tire ve nokta bırak
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, '-');
  
  // Birden fazla tire varsa tek tire yap
  sanitized = sanitized.replace(/-+/g, '-');
  
  // Başında ve sonunda tire varsa kaldır
  sanitized = sanitized.replace(/^-+|-+$/g, '');
  
  return sanitized;
}

// Dosya boyutunu kontrol etme (maksimum 5MB)
export function validateImageFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    return { valid: false, error: 'Dosya seçilmedi' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Desteklenmeyen dosya türü. Sadece JPG, PNG, GIF ve WebP dosyaları kabul edilir.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.' };
  }
  
  return { valid: true };
}
