import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

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
    
    // Yorumu veritabanından sil
    await deleteDoc(doc(db, 'comments', data.commentId));
    
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