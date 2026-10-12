import { imageDimensions } from './image-metadata.js';
import { put, del } from "@vercel/blob";
import {
  addImageMetadata,
  getAllImageMetadata,
  deleteImageMetadata,
  findImageByUrl
} from './mysql-gallery.js';

// Vercel Blob Storage'a resim yükleme
export async function uploadImageToBlob(file, fileName, metadata = {}) {
  try {
    // beyond-samet-gallery klasöründe dosyayı sakla
    const blobPath = `beyond-samet-gallery/${fileName}`;

    const dimensions = await imageDimensions(file);
    const { url, pathname } = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Metadata başarısızsa yüklenen dosyayı geri al.
    try {
      const imageMetadata = {
        width: dimensions.width,
        height: dimensions.height,
        url,
        path: pathname,
        fileName,
        title: metadata.title || fileName.split('.')[0],
        description: metadata.description || '',
        order: metadata.order ?? 999,
        size: file.size,
        type: file.type,
        originalName: metadata.originalName || file.name
      };

      const mysqlResult = await addImageMetadata(imageMetadata);
      if (!mysqlResult.success) throw new Error('Görsel bilgileri kaydedilemedi');

      return {
        success: true,
        url,
        path: pathname,
        metadataId: mysqlResult.id
      };
    } catch (mysqlError) {
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      console.error('Görsel bilgileri kaydedilemedi:', mysqlError);
      return {
        success: false,
        error: 'Görsel bilgileri kaydedilemedi'
      };
    }

  } catch (error) {
    console.error('Blob storage upload error:', error);
    return { success: false, error: error.message };
  }
}

// Galeri klasöründeki tüm resimleri listele (MySQL'den metadata ile)
export async function listGalleryImages() {
  const result = await getAllImageMetadata();
  if (!result.success) return { success: false, error: 'Galeri yüklenemedi', images: [] };
  return { success: true, images: result.images };
}

// Blob storage'dan resim silme (MySQL metadata'sı ile birlikte)
export async function deleteImageFromBlob(url) {
  try {
    // Blob silinemediğinde metadata kaydı korunur.
    const findResult = await findImageByUrl(url);
    if (!findResult.success) return { success: false, error: 'Görsel kaydı bulunamadı veya veritabanına ulaşılamadı' };
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    const deleted = await deleteImageMetadata(findResult.image.id);
    if (!deleted.success) return { success: false, error: 'Dosya silindi ancak görsel kaydı silinemedi; yeniden deneyin' };
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
