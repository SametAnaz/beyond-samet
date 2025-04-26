import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Zorunlu alanları kontrol et
    if (!data.name || !data.content || !data.slug) {
      return NextResponse.json(
        { message: 'İsim, içerik ve slug alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // Yorumu veritabanına ekle
    const commentRef = await addDoc(collection(db, 'comments'), {
      name: data.name,
      email: data.email || null,
      content: data.content,
      slug: data.slug,
      ipAddress: data.ipAddress || 'unknown',
      userAgent: data.userAgent || {},
      createdAt: serverTimestamp(),
      hidden: false
    });
    
    return NextResponse.json({ 
      success: true, 
      id: commentRef.id, 
      message: 'Yorum başarıyla eklendi' 
    });
    
  } catch (error) {
    console.error('Yorum eklenirken hata:', error);
    
    return NextResponse.json(
      { message: 'Yorum eklenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 