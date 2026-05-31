import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { pool } from '@/lib/mysql-posts';

export async function PUT(request) {
  const authResponse = requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const data = await request.json();
    
    // Zorunlu parametreler kontrolü
    if (!data.commentId || !data.data) {
      return NextResponse.json(
        { message: 'Yorum ID`si ve güncellenecek veri gereklidir' },
        { status: 400 }
      );
    }
    
    const updateData = data.data;
    // Dinamik olarak güncelleme sorgusu oluştur
    const updateFields = [];
    const updateValues = [];
    
    if (updateData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(updateData.name);
    }
    if (updateData.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(updateData.email);
    }
    if (updateData.content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(updateData.content);
    }
    if (updateData.approved !== undefined) {
      updateFields.push('approved = ?');
      updateValues.push(updateData.approved);
    }
    
    // updatedAt her zaman güncelle
    updateFields.push('updatedAt = ?');
    updateValues.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
    
    // commentId'yi en sona ekle
    updateValues.push(data.commentId);
    
    const query = `UPDATE comments SET ${updateFields.join(', ')} WHERE id = ?`;
    
    const [result] = await pool.execute(query, updateValues);
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }
    
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