import { NextResponse } from 'next/server';
import { addComment } from '@/lib/mysql-posts';

// IP adresinden konum bilgisi alacak fonksiyon
async function getLocationFromIP(ip) {
  try {
    // Test IP'si veya özel IP'ler için konum bilgisi alamayız
    if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'unknown', city: 'unknown' };
    }
    
    // ipinfo.io servisini kullanarak konum bilgisini alma
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    if (!response.ok) {
      throw new Error('IP bilgisi alınamadı');
    }
    
    const data = await response.json();
    return {
      country: data.country || 'unknown',
      city: data.city || 'unknown',
      region: data.region || 'unknown'
    };
  } catch (error) {
    console.error('Konum bilgisi alınırken hata:', error);
    return { country: 'unknown', city: 'unknown' };
  }
}

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
    
    // IP adresinden konum bilgisini alma (asenkron)
    const locationData = await getLocationFromIP(data.ipAddress || 'unknown');
    
    // Yorumu MySQL'e ekle
    const commentData = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      email: data.email || null,
      content: data.content,
      slug: data.slug,
      approved: 0, // Yeni yorumlar onay bekliyor (0 = bekliyor, 1 = onaylı)
      parentId: data.parentId || null,
      ipAddress: data.ipAddress || 'unknown',
      userAgent: JSON.stringify(data.userAgent || {}),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await addComment(commentData);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Yorum eklenirken bir hata oluştu: ' + result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      id: result.id, 
      message: 'Yorum başarıyla eklendi ve onay bekliyor' 
    });
    
  } catch (error) {
    console.error('Yorum eklenirken hata:', error);
    
    return NextResponse.json(
      { message: 'Yorum eklenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 