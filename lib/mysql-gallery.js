import mysql from 'mysql2/promise';
import { getDatabaseConfig } from './mysql-config.js';

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool(getDatabaseConfig());

// Veritabanı tablosunu oluştur (ilk çalıştırmada)
export async function initializeGalleryTable() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id VARCHAR(50) PRIMARY KEY,
        url TEXT NOT NULL,
        path TEXT NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        \`order\` INT DEFAULT 999,
        size BIGINT NOT NULL,
        type VARCHAR(100) NOT NULL,
        originalName VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('✅ Gallery tablosu hazır');
    return { success: true };
  } catch (error) {
    console.error('❌ Veritabanı hatası:', error);
    return { success: false, error: error.message };
  }
}

// Yeni resim metadata'sı ekleme
export async function addImageMetadata(imageData) {
  try {
    const connection = await pool.getConnection();
    
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await connection.execute(
      `INSERT INTO gallery_images 
       (id, url, path, fileName, title, description, \`order\`, size, type, originalName) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        imageId,
        imageData.url,
        imageData.path,
        imageData.fileName,
        imageData.title,
        imageData.description || '',
        imageData.order || 999,
        imageData.size,
        imageData.type,
        imageData.originalName
      ]
    );
    
    connection.release();
    return { success: true, id: imageId };
  } catch (error) {
    console.error('Error adding image metadata:', error);
    return { success: false, error: error.message };
  }
}

// Resim metadata'sını güncelleme
export async function updateImageMetadata(id, updateData) {
  try {
    const connection = await pool.getConnection();
    
    const updateFields = [];
    const values = [];
    
    if (updateData.title !== undefined) {
      updateFields.push('title = ?');
      values.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updateData.description);
    }
    if (updateData.order !== undefined) {
      updateFields.push('`order` = ?');
      values.push(updateData.order);
    }
    
    if (updateFields.length === 0) {
      connection.release();
      return { success: false, error: 'No fields to update' };
    }
    
    values.push(id);
    
    await connection.execute(
      `UPDATE gallery_images SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    connection.release();
    return { success: true };
  } catch (error) {
    console.error('Error updating image metadata:', error);
    return { success: false, error: error.message };
  }
}

// Resim metadata'sını silme
export async function deleteImageMetadata(id) {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute('DELETE FROM gallery_images WHERE id = ?', [id]);
    
    connection.release();
    return { success: true };
  } catch (error) {
    console.error('Error deleting image metadata:', error);
    return { success: false, error: error.message };
  }
}

// Tüm resim metadata'larını getirme (sıralı)
export async function getAllImageMetadata() {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM gallery_images ORDER BY `order` ASC, createdAt DESC'
    );
    
    connection.release();
    
    // Tarih formatını düzelt
    const images = rows.map(row => ({
      ...row,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
    
    return { success: true, images };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    return { success: false, error: error.message, images: [] };
  }
}

// Tek resim metadata'sını getirme
export async function getImageMetadata(id) {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM gallery_images WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    if (rows.length > 0) {
      return { success: true, image: rows[0] };
    } else {
      return { success: false, error: 'Image not found' };
    }
  } catch (error) {
    console.error('Error getting image metadata:', error);
    return { success: false, error: error.message };
  }
}

// URL'ye göre resim bulma
export async function findImageByUrl(url) {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM gallery_images WHERE url = ?',
      [url]
    );
    
    connection.release();
    
    if (rows.length > 0) {
      return { success: true, image: rows[0] };
    } else {
      return { success: false, error: 'Image not found' };
    }
  } catch (error) {
    console.error('Error finding image by URL:', error);
    return { success: false, error: error.message };
  }
}

// Resim sırasını güncelleme
export async function updateImageOrder(imageId, newOrder) {
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'UPDATE gallery_images SET `order` = ? WHERE id = ?',
      [newOrder, imageId]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Resim bulunamadı' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Resim sırası güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Gallery için alias
export const getAllGalleryImages = getAllImageMetadata;

export default pool;
