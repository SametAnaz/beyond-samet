import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { pool } from '@/lib/mysql-posts';

export async function DELETE(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const data = await request.json();
    
    // Zorunlu parametre kontrolü
    if (!data.commentId) {
      return NextResponse.json(
        { message: 'Yorum ID`si gereklidir' },
        { status: 400 }
      );
    }
    
    // Yorumu MySQL'den sil
    const [result] = await pool.execute(
      'DELETE FROM comments WHERE id = ?',
      [data.commentId]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Yorum başarıyla silindi' 
    });
    
  } catch (error) {
    console.error('Yorum silinirken hata:', error);
    
    return NextResponse.json(
      { message: 'Yorum silinirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 