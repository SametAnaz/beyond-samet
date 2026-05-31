import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { put, del, list } from '@vercel/blob';
import { sanitizeFileName, validateImageFile } from '@/lib/blob-storage';
import { 
  addBlogImage, 
  getAllBlogImages, 
  updateBlogImage, 
  deleteBlogImage,
  initializeBlogImagesTable 
} from '@/lib/mysql-posts';

// GET - Tüm blog image'larını getir
export async function GET(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    // Tabloyu başlat
    await initializeBlogImagesTable();
    
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');
    
    let result;
    if (postSlug) {
      // Belirli bir post'un image'larını getir
      const { getBlogImagesBySlug } = await import('@/lib/mysql-posts');
      result = await getBlogImagesBySlug(postSlug);
    } else {
      // Tüm image'ları getir
      result = await getAllBlogImages();
    }
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      images: result.images
    });
  } catch (error) {
    console.error('❌ Blog images GET hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Blog images alınamadı'
    }, { status: 500 });
  }
}

// POST - Yeni blog image yükle
export async function POST(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    // Tabloyu başlat
    await initializeBlogImagesTable();
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    const title = formData.get('title') || file.name;
    const alt = formData.get('alt') || title;
    const description = formData.get('description') || '';
    const postSlug = formData.get('postSlug') || null;
    const parsedOrder = Number.parseInt(formData.get('order') || '999', 10);
    const order = Number.isInteger(parsedOrder) ? parsedOrder : 999;
    
    // Vercel Blob'a yükle
    const safeName = sanitizeFileName(file.name) || `image-${Date.now()}`;
    const filename = `blog-images/${Date.now()}-${safeName}`;
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    // MySQL'e metadata kaydet
    const imageData = {
      id: `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: blob.url,
      path: filename,
      fileName: file.name,
      title,
      alt,
      description,
      postSlug,
      order,
      size: file.size,
      type: file.type,
      originalName: file.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await addBlogImage(imageData);
    
    if (!result.success) {
      // Blob'u sil (metadata kayıt başarısız)
      try {
        await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (delError) {
        console.error('Blob silme hatası:', delError);
      }
      
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      image: imageData,
      message: 'Blog image başarıyla yüklendi'
    });
  } catch (error) {
    console.error('❌ Blog image POST hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Blog image yüklenemedi'
    }, { status: 500 });
  }
}

// PUT - Blog image güncelle
export async function PUT(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Image ID gerekli'
      }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    const result = await updateBlogImage(id, updateData);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog image başarıyla güncellendi'
    });
  } catch (error) {
    console.error('❌ Blog image PUT hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Blog image güncellenemedi'
    }, { status: 500 });
  }
}

// DELETE - Blog image sil
export async function DELETE(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Image ID gerekli'
      }, { status: 400 });
    }
    
    // Önce image bilgisini al (blob URL'i için)
    const imagesResult = await getAllBlogImages();
    if (!imagesResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Blog images alınamadı'
      }, { status: 500 });
    }
    
    const image = imagesResult.images.find(img => img.id === id);
    if (!image) {
      return NextResponse.json({
        success: false,
        error: 'Blog image bulunamadı'
      }, { status: 404 });
    }
    
    // MySQL'den sil
    const result = await deleteBlogImage(id);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
    // Vercel Blob'dan sil
    try {
      await del(image.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch (delError) {
      console.error('⚠️  Blob silme hatası (metadata silindi ama blob kaldı):', delError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog image başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Blog image DELETE hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Blog image silinemedi'
    }, { status: 500 });
  }
}
