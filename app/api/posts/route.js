import { listPosts, getPostById } from '@/lib/posts-query';
import { normalizePost } from '@/lib/post-utils';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getAllPosts, addPost, updatePost, deletePost } from '@/lib/mysql-posts';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const admin = params.get('admin') === 'true';
  if (admin) { const denied = requireAdmin(request); if (denied) return denied; }
  try {
    const data = await listPosts({ page: params.get('page'), limit: params.get('limit'), query: params.get('q') || '', tag: params.get('tag') || '', admin, published: admin && params.has('published') ? params.get('published') === 'true' : undefined });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json({ error: 'Blog yazıları yüklenemedi' }, { status: 503 });
  }
}

// POST - Yeni blog yazısı ekle
export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    // Tabloyu başlat
    
    let postData;
    try { postData = normalizePost(await request.json()); } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
    
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
      readingTime: postData.readingTime,
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
    
    invalidatePost(newPost.slug);
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
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID gerekli' },
        { status: 400 }
      );
    }
    
    let updateData;
    try { updateData = normalizePost(await request.json(), { partial: true }); } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
    const existing = await getPostById(id);
    if (!existing) return NextResponse.json({ error: 'Blog yazısı bulunamadı' }, { status: 404 });
    if ((updateData.published ?? existing.published) && !(updateData.content ?? existing.content).trim()) return NextResponse.json({ error: 'Yayınlamak için içerik gerekli' }, { status: 400 });
    
    // updatedAt'i güncelle
    updateData.updatedAt = new Date().toISOString();
    
    const result = await updatePost(id, updateData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    invalidatePost(existing.slug);
    if (updateData.slug) invalidatePost(updateData.slug);
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
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID gerekli' },
        { status: 400 }
      );
    }
    
    const existing = await getPostById(id);
    const result = await deletePost(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    invalidatePost(existing?.slug);
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

function invalidatePost(slug) {
  for (const path of ['/', '/blog', '/projects', '/sitemap.xml']) revalidatePath(path);
  if (slug) revalidatePath(`/blog/${slug}`);
}
