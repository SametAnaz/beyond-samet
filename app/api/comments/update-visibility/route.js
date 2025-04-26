import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Zorunlu alanları kontrol et
    if (!data.commentId) {
      return NextResponse.json(
        { message: 'Yorum ID değeri gereklidir' },
        { status: 400 }
      );
    }
    
    if (data.hidden === undefined) {
      return NextResponse.json(
        { message: 'hidden parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // Yorumu güncelle
    const commentRef = doc(db, 'comments', data.commentId);
    await updateDoc(commentRef, {
      hidden: data.hidden
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Yorum başarıyla ${data.hidden ? 'gizlendi' : 'görünür yapıldı'}.` 
    });
    
  } catch (error) {
    console.error('Yorum güncellenirken hata:', error);
    
    return NextResponse.json(
      { message: 'Yorum güncellenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 