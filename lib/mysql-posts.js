import mysql from 'mysql2/promise';

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool({
  host: '95.70.204.147',
  port: 3306,
  user: 'root',
  password: 'bMYDUJx6usmjOFiV36HqUUD8i40SiuM',
  database: 'beyond_samet_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Posts tablosunu oluştur
export async function initializePostsTable() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        published BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        author VARCHAR(255) DEFAULT 'Samet Anaz',
        tags JSON,
        metaDescription TEXT,
        readingTime INT DEFAULT 0,
        views INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_published (published),
        INDEX idx_featured (featured),
        INDEX idx_created (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('✅ Posts tablosu hazır');
    return { success: true };
  } catch (error) {
    console.error('❌ Posts tablo hatası:', error);
    return { success: false, error: error.message };
  }
}

// Blog Images tablosunu oluştur
export async function initializeBlogImagesTable() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blog_images (
        id VARCHAR(50) PRIMARY KEY,
        url TEXT NOT NULL,
        path TEXT NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        alt VARCHAR(255),
        description TEXT,
        postSlug VARCHAR(255),
        \`order\` INT DEFAULT 999,
        size BIGINT NOT NULL,
        type VARCHAR(100) NOT NULL,
        originalName VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_post_slug (postSlug),
        INDEX idx_order (\`order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('✅ Blog Images tablosu hazır');
    return { success: true };
  } catch (error) {
    console.error('❌ Blog Images tablo hatası:', error);
    return { success: false, error: error.message };
  }
}

// Comments tablosunu oluştur
export async function initializeCommentsTable() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        content TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL,
        approved BOOLEAN DEFAULT false,
        parentId VARCHAR(50) NULL,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_approved (approved),
        INDEX idx_parent (parentId),
        INDEX idx_created (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    console.log('✅ Comments tablosu hazır');
    return { success: true };
  } catch (error) {
    console.error('❌ Comments tablo hatası:', error);
    return { success: false, error: error.message };
  }
}

// Post ekleme
export async function addPost(postData) {
  try {
    const connection = await pool.getConnection();
    
    // ISO tarihlerini MySQL datetime formatına çevir
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return new Date().toISOString().slice(0, 19).replace('T', ' ');
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    
    const [result] = await connection.execute(`
      INSERT INTO posts (id, title, content, excerpt, slug, published, featured, author, tags, metaDescription, readingTime, views, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      postData.id,
      postData.title,
      postData.content,
      postData.excerpt || '',
      postData.slug,
      postData.published || false,
      postData.featured || false,
      postData.author || 'Samet Anaz',
      JSON.stringify(postData.tags || []),
      postData.metaDescription || '',
      postData.readingTime || 0,
      postData.views || 0,
      formatDateForMySQL(postData.createdAt),
      formatDateForMySQL(postData.updatedAt)
    ]);
    
    connection.release();
    return { success: true, id: postData.id };
  } catch (error) {
    console.error('❌ Post ekleme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Comment ekleme
export async function addComment(commentData) {
  try {
    const connection = await pool.getConnection();
    
    // ISO tarihlerini MySQL datetime formatına çevir
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return new Date().toISOString().slice(0, 19).replace('T', ' ');
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    
    const [result] = await connection.execute(`
      INSERT INTO comments (id, name, email, content, slug, approved, parentId, ipAddress, userAgent, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      commentData.id,
      commentData.name,
      commentData.email || null,
      commentData.content,
      commentData.slug,
      commentData.approved ?? 0,
      commentData.parentId || null,
      commentData.ipAddress || null,
      commentData.userAgent || null,
      formatDateForMySQL(commentData.createdAt),
      formatDateForMySQL(commentData.updatedAt)
    ]);
    
    connection.release();
    return { success: true, id: commentData.id };
  } catch (error) {
    console.error('❌ Comment ekleme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Tüm postları getir
export async function getAllPosts() {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT * FROM posts 
      ORDER BY createdAt DESC
    `);
    
    connection.release();
    
    // JSON tags'ları parse et
    const posts = rows.map(row => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
    }));
    
    return { success: true, posts };
  } catch (error) {
    console.error('❌ Posts getirme hatası:', error);
    return { success: false, error: error.message, posts: [] };
  }
}

// Post slug'a göre getir
export async function getPostBySlug(slug) {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT * FROM posts WHERE slug = ? LIMIT 1
    `, [slug]);
    
    connection.release();
    
    if (rows.length === 0) {
      return { success: false, error: 'Post bulunamadı' };
    }
    
    const post = {
      ...rows[0],
      tags: typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : rows[0].tags
    };
    
    return { success: true, post };
  } catch (error) {
    console.error('❌ Post getirme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Post'a ait yorumları getir
export async function getCommentsBySlug(slug) {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT * FROM comments 
      WHERE slug = ? AND approved = true 
      ORDER BY createdAt ASC
    `, [slug]);
    
    connection.release();
    return { success: true, comments: rows };
  } catch (error) {
    console.error('❌ Comments getirme hatası:', error);
    return { success: false, error: error.message, comments: [] };
  }
}

// Post güncelleme
export async function updatePost(id, updateData) {
  try {
    const connection = await pool.getConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (updateData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updateData.title);
    }
    if (updateData.content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(updateData.content);
    }
    if (updateData.excerpt !== undefined) {
      updateFields.push('excerpt = ?');
      updateValues.push(updateData.excerpt);
    }
    if (updateData.slug !== undefined) {
      updateFields.push('slug = ?');
      updateValues.push(updateData.slug);
    }
    if (updateData.published !== undefined) {
      updateFields.push('published = ?');
      updateValues.push(updateData.published ? 1 : 0);
    }
    if (updateData.featured !== undefined) {
      updateFields.push('featured = ?');
      updateValues.push(updateData.featured ? 1 : 0);
    }
    if (updateData.author !== undefined) {
      updateFields.push('author = ?');
      updateValues.push(updateData.author);
    }
    if (updateData.tags !== undefined) {
      updateFields.push('tags = ?');
      updateValues.push(JSON.stringify(updateData.tags));
    }
    if (updateData.metaDescription !== undefined) {
      updateFields.push('metaDescription = ?');
      updateValues.push(updateData.metaDescription);
    }
    if (updateData.readingTime !== undefined) {
      updateFields.push('readingTime = ?');
      updateValues.push(updateData.readingTime);
    }
    
    // updatedAt her zaman güncelle
    updateFields.push('updatedAt = ?');
    updateValues.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
    
    // id'yi en sona ekle
    updateValues.push(id);
    
    const query = `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`;
    
    const [result] = await connection.execute(query, updateValues);
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Post bulunamadı' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Post güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Post silme
export async function deletePost(id) {
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM posts WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Post bulunamadı' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Post silme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Blog image ekleme
export async function addBlogImage(imageData) {
  try {
    const connection = await pool.getConnection();
    
    // ISO tarihlerini MySQL datetime formatına çevir
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return new Date().toISOString().slice(0, 19).replace('T', ' ');
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    
    const [result] = await connection.execute(`
      INSERT INTO blog_images (id, url, path, fileName, title, alt, description, postSlug, \`order\`, size, type, originalName, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      imageData.id,
      imageData.url,
      imageData.path,
      imageData.fileName,
      imageData.title,
      imageData.alt || imageData.title,
      imageData.description || '',
      imageData.postSlug || null,
      imageData.order || 999,
      imageData.size,
      imageData.type,
      imageData.originalName,
      formatDateForMySQL(imageData.createdAt),
      formatDateForMySQL(imageData.updatedAt)
    ]);
    
    connection.release();
    return { success: true, id: imageData.id };
  } catch (error) {
    console.error('❌ Blog image ekleme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Tüm blog image'larını getir
export async function getAllBlogImages() {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT * FROM blog_images 
      ORDER BY postSlug, \`order\` ASC, createdAt DESC
    `);
    
    connection.release();
    return { success: true, images: rows };
  } catch (error) {
    console.error('❌ Blog images getirme hatası:', error);
    return { success: false, error: error.message, images: [] };
  }
}

// Post'a ait blog image'larını getir
export async function getBlogImagesBySlug(slug) {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT * FROM blog_images 
      WHERE postSlug = ? 
      ORDER BY \`order\` ASC, createdAt DESC
    `, [slug]);
    
    connection.release();
    return { success: true, images: rows };
  } catch (error) {
    console.error('❌ Blog images getirme hatası:', error);
    return { success: false, error: error.message, images: [] };
  }
}

// Blog image güncelleme
export async function updateBlogImage(id, updateData) {
  try {
    const connection = await pool.getConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (updateData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updateData.title);
    }
    if (updateData.alt !== undefined) {
      updateFields.push('alt = ?');
      updateValues.push(updateData.alt);
    }
    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updateData.description);
    }
    if (updateData.postSlug !== undefined) {
      updateFields.push('postSlug = ?');
      updateValues.push(updateData.postSlug);
    }
    if (updateData.order !== undefined) {
      updateFields.push('`order` = ?');
      updateValues.push(parseInt(updateData.order));
    }
    
    // updatedAt her zaman güncelle
    updateFields.push('updatedAt = ?');
    updateValues.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
    
    // id'yi en sona ekle
    updateValues.push(id);
    
    const query = `UPDATE blog_images SET ${updateFields.join(', ')} WHERE id = ?`;
    
    const [result] = await connection.execute(query, updateValues);
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Blog image bulunamadı' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Blog image güncelleme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Blog image silme
export async function deleteBlogImage(id) {
  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM blog_images WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    if (result.affectedRows === 0) {
      return { success: false, error: 'Blog image bulunamadı' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Blog image silme hatası:', error);
    return { success: false, error: error.message };
  }
}

export { pool };
