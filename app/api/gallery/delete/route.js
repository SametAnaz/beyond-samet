import { NextResponse } from 'next/server';
import { deleteImageFromBlob } from '../../../../lib/blob-storage';

export async function DELETE(request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'Resim URL\'si gerekli' },
        { status: 400 }
      );
    }
    
    const result = await deleteImageFromBlob(url);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Resim başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Resim silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
