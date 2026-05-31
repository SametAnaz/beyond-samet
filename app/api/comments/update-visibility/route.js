import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { pool } from '@/lib/mysql-posts';

export async function POST(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const data = await request.json();
    
    // Zorunlu alanları kontrol et
    if (!data.commentId) {
      return NextResponse.json(
        { message: 'Yorum ID değeri gereklidir' },
        { status: 400 }
      );
    }
    
    if (data.approved === undefined) {
      return NextResponse.json(
        { message: 'approved parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // Yorumu MySQL'de güncelle (approved field)
    const [result] = await pool.execute(
      'UPDATE comments SET approved = ?, updatedAt = ? WHERE id = ?',
      [
        data.approved,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        data.commentId
      ]
    );
    
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Yorum başarıyla ${data.approved ? 'onaylandı' : 'onayı kaldırıldı'}.` 
    });
    
  } catch (error) {
    console.error('Yorum güncellenirken hata:', error);
    
    return NextResponse.json(
      { message: 'Yorum güncellenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 