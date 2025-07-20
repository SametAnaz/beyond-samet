import { NextResponse } from 'next/server';
import { listGalleryImages } from '../../../lib/blob-storage';

export async function GET() {
  try {
    const result = await listGalleryImages();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    // Resimler zaten formatlanmış şekilde geliyor (Firebase'den veya blob'dan)
    return NextResponse.json({ images: result.images });
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: 'Galeri resimleri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
