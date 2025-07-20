import { NextResponse } from 'next/server';
import { uploadImageToBlob, sanitizeFileName, validateImageFile } from '../../../../lib/blob-storage';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const customTitle = formData.get('title');
    const description = formData.get('description');
    const order = formData.get('order') || '999';
    
    // Dosya validasyonu
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Dosya adını belirle
    let fileName;
    const extension = file.name.split('.').pop();
    const baseName = customTitle ? sanitizeFileName(customTitle) : sanitizeFileName(file.name.split('.')[0]);
    
    // Benzersiz isim için timestamp ekle
    const timestamp = Date.now();
    fileName = `${baseName}-${timestamp}.${extension}`;
    
    // Metadata oluştur
    const metadata = {
      title: customTitle || file.name.split('.')[0],
      description: description || '',
      order: parseInt(order),
      originalName: file.name
    };
    
    // Blob storage'a yükle
    const result = await uploadImageToBlob(file, fileName, metadata);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: fileName,
      metadataId: result.metadataId,
      message: 'Resim başarıyla yüklendi'
    });
    
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Resim yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
