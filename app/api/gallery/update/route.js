import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { updateImageMetadata } from '../../../../lib/mysql-gallery';

export async function PUT(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const { id, title, description, order } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resim ID\'si gerekli' },
        { status: 400 }
      );
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = parseInt(order);
    
    const result = await updateImageMetadata(id, updateData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Resim bilgileri başarıyla güncellendi'
    });
    
  } catch (error) {
    console.error('Update metadata API error:', error);
    return NextResponse.json(
      { error: 'Resim bilgileri güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
