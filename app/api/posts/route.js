import { NextResponse } from 'next/server';
import { getAllPosts, addPost, updatePost, deletePost, initializePostsTable } from '@/lib/mysql-posts';
import { getAdminSession, requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const published = searchParams.get('published');
    const isAdmin = Boolean(getAdminSession(request));
    
    const result = await getAllPosts();
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Blog yazıları yüklenemedi' },
        { status: 500 }
      );
    }
    
    let posts = result.posts;
    
    // Published filter. Public callers can only see published posts;
    // admins can explicitly request drafts/unpublished posts.
    if (!isAdmin) {
      posts = posts.filter(post => post.published === 1);
    } else if (published !== null) {
      const isPublished = published === 'true';
      posts = posts.filter(post => (isPublished ? post.published === 1 : post.published === 0));
    }
    
    // Pagination
    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
    
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      { error: 'Blog yazıları yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni blog yazısı ekle
export async function POST(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    // Tabloyu başlat
    await initializePostsTable();
    
    const postData = await request.json();
    
    // Gerekli alanları kontrol et
    if (!postData.title || !postData.slug) {
      return NextResponse.json(
        { error: 'Başlık ve slug gerekli' },
        { status: 400 }
      );
    }
    
    // Post verisini hazırla
    const newPost = {
      id: postData.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: postData.title,
      content: postData.content || '',
      excerpt: postData.excerpt || '',
      slug: postData.slug,
      published: postData.published ? 1 : 0,
      featured: postData.featured ? 1 : 0,
      author: postData.author || 'Samet Anaz',
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      metaDescription: postData.metaDescription || '',
      readingTime: postData.readingTime || 0,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await addPost(newPost);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      post: newPost,
      message: 'Blog yazısı başarıyla eklendi'
    });
    
  } catch (error) {
    console.error('Post ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Blog yazısı eklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Blog yazısı güncelle
export async function PUT(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID gerekli' },
        { status: 400 }
      );
    }
    
    const updateData = await request.json();
    
    // updatedAt'i güncelle
    updateData.updatedAt = new Date().toISOString();
    
    const result = await updatePost(id, updateData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla güncellendi'
    });
    
  } catch (error) {
    console.error('Post güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Blog yazısı güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Blog yazısı sil
export async function DELETE(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID gerekli' },
        { status: 400 }
      );
    }
    
    const result = await deletePost(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Post silme hatası:', error);
    return NextResponse.json(
      { error: 'Blog yazısı silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
