import { Resend } from 'resend';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

const MAX_FIELD_LENGTHS = {
  name: 120,
  email: 254,
  subject: 180,
  message: 5000,
};

function sanitizeText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: 'contact',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const formData = await request.json();
    const name = sanitizeText(formData.name, MAX_FIELD_LENGTHS.name);
    const email = sanitizeText(formData.email, MAX_FIELD_LENGTHS.email);
    const subject = sanitizeText(formData.subject, MAX_FIELD_LENGTHS.subject);
    const message = sanitizeText(formData.message, MAX_FIELD_LENGTHS.message);

    if (!name || !email || !subject || !message) {
      return Response.json(
        { success: false, message: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { success: false, message: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('Resend API anahtarı bulunamadı!');
      return Response.json(
        { success: false, message: 'Mesaj şu anda gönderilemiyor. Lütfen daha sonra tekrar deneyiniz.' },
        { status: 503 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailContent = `
      İsim: ${name}
      E-posta: ${email}
      Konu: ${subject}
      Mesaj: ${message}
    `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.EMAIL_TO || 'sametanaz.tr@gmail.com',
      subject: `İletişim Formu: ${subject}`,
      text: emailContent,
      reply_to: email,
    });

    return Response.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağım.'
    });
  } catch (error) {
    console.error('İşlem hatası:', error);
    return Response.json(
      { success: false, message: 'Mesajınız işlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}
