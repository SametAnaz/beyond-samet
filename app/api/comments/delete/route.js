import { NextResponse } from 'next/server';
import { pool } from '@/lib/mysql-posts';

export async function DELETE(request) {
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
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM comments WHERE id = ?',
      [data.commentId]
    );
    
    connection.release();
    
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