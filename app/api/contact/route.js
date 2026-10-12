import { Resend } from 'resend';
import { limitRequest } from '@/lib/rate-limit';
export async function POST(request) {
  const limited = limitRequest(request, 'contact', { limit: 5, windowMs: 60 * 60_000 });
  if (limited) return limited;
  try {
    const input = await request.json();
    const fields = {};
    for (const [key, max] of Object.entries({ name: 100, email: 254, subject: 200, message: 10_000 })) {
      if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > max) return Response.json({ success: false, message: 'Lütfen form alanlarını geçerli bilgilerle doldurun.' }, { status: 400 });
      fields[key] = input[key].trim();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return Response.json({ success: false, message: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
    if (!process.env.RESEND_API_KEY) return Response.json({ success: false, message: 'E-posta hizmeti şu anda kullanılamıyor. Doğrudan e-posta gönderebilirsiniz.' }, { status: 503 });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.CONTACT_TO_EMAIL || 'sametanaz.tr@gmail.com',
      subject: `İletişim Formu: ${fields.subject}`, replyTo: fields.email,
      text: `İsim: ${fields.name}\nE-posta: ${fields.email}\n\n${fields.message}`,
    });
    if (error) { console.error('E-posta hizmeti hatası:', error.name); return Response.json({ success: false, message: 'Mesajınız gönderilemedi. Lütfen tekrar deneyin veya doğrudan e-posta gönderin.' }, { status: 502 }); }
    return Response.json({ success: true, message: 'Mesajınız gönderildi. En kısa sürede size dönüş yapacağım.' });
  } catch (error) { console.error('İletişim hatası:', error.name); return Response.json({ success: false, message: 'Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.' }, { status: 500 }); }
}
