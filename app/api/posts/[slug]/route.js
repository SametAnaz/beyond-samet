import { NextResponse } from 'next/server';
import { getPostBySlug, getCommentsBySlug } from '@/lib/mysql-posts';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parametresi gerekli' },
        { status: 400 }
      );
    }
    
    // Post'u getir
    const postResult = await getPostBySlug(slug);
    
    if (!postResult.success) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Bu post'a ait yorumları getir
    const commentsResult = await getCommentsBySlug(slug);
    
    return NextResponse.json({
      post: postResult.post,
      comments: commentsResult.success ? commentsResult.comments : []
    });
    
  } catch (error) {
    console.error('Post detail API error:', error);
    return NextResponse.json(
      { error: 'Blog yazısı yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
