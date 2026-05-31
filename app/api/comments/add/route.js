import { NextResponse } from 'next/server';
import { addComment } from '@/lib/mysql-posts';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

function sanitizeText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function sanitizeEmail(value) {
  const email = sanitizeText(value, 254);
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

async function getLocationFromIP(ip) {
  try {
    if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'unknown', city: 'unknown' };
    }
    
    const response = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
      signal: AbortSignal.timeout(1500),
    });
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
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'comments-add',
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const data = await request.json();
    const name = sanitizeText(data.name, 120);
    const content = sanitizeText(data.content, 2000);
    const slug = sanitizeText(data.slug, 180);
    const email = sanitizeEmail(data.email);
    
    if (!name || !content || !slug) {
      return NextResponse.json(
        { message: 'İsim, içerik ve slug alanları zorunludur' },
        { status: 400 }
      );
    }
    
    const ipAddress = getClientIp(request);
    await getLocationFromIP(ipAddress);
    
    const commentData = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      content,
      slug,
      approved: 0,
      parentId: data.parentId || null,
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await addComment(commentData);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Yorum eklenirken bir hata oluştu' },
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
      { message: 'Yorum eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
