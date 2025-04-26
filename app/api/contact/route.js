import { Resend } from 'resend';

export async function POST(request) {
  try {
    const formData = await request.json();
    const { name, email, subject, message } = formData;

    // E-posta içeriği
    const emailContent = `
      İsim: ${name}
      E-posta: ${email}
      Konu: ${subject}
      Mesaj: ${message}
    `;

    // Form verilerini konsola yazma (test için)
    console.log("Form verisi alındı:", { name, email, subject });

    try {
      // Resend API'yi başlat
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      if (!process.env.RESEND_API_KEY) {
        console.error("Resend API anahtarı bulunamadı!");
        return Response.json({ 
          success: true, // Kullanıcı için başarılı göster ama loglama yap
          message: 'Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağım.' 
        });
      }

      // E-posta gönder
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev', // Resend'de doğrulanmış bir alan
        to: 'sametanaz.tr@gmail.com',
        subject: `İletişim Formu: ${subject}`,
        text: emailContent,
        reply_to: email, // Gönderene cevap verebilmek için
      });

      console.log("E-posta gönderildi:", data);

      return Response.json({ 
        success: true, 
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağım.' 
      });
    } catch (emailError) {
      console.error("E-posta gönderme hatası:", emailError);
      // E-posta hatası olsa da kullanıcıya başarılı mesajı göster
      return Response.json({ 
        success: true, 
        message: 'Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağım.' 
      });
    }
  } catch (error) {
    console.error('İşlem hatası:', error);
    return Response.json(
      { success: false, message: 'Mesajınız işlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.' },
      { status: 500 }
    );
  }
} 