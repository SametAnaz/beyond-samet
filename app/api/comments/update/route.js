import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';

export async function PUT(request) {
  try {
    const data = await request.json();
    
    // Zorunlu parametreler kontrolü
    if (!data.commentId || !data.data) {
      return NextResponse.json(
        { message: 'Yorum ID`si ve güncellenecek veri gereklidir' },
        { status: 400 }
      );
    }
    
    // Yorumu güncelle
    const commentRef = doc(db, 'comments', data.commentId);
    await updateDoc(commentRef, data.data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Yorum başarıyla güncellendi' 
    });
    
  } catch (error) {
    console.error('Yorum güncellenirken hata:', error);
    
    return NextResponse.json(
      { message: 'Yorum güncellenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 