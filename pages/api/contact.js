import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Yalnızca POST metoduna izin var." });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Eksik alan var." });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.eu.mailgun.org",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILGUN_SMTP_USER,
      pass: process.env.MAILGUN_SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"İletişim Formu" <${process.env.MAILGUN_SMTP_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "Yeni İletişim Formu Mesajı",
      text: `Ad: ${name}\nE-posta: ${email}\nMesaj:\n${message}`,
    });

    res.status(200).json({ message: "Mail başarıyla gönderildi." });
  } catch (error) {
    console.error("Mail gönderim hatası:", error);
    res.status(500).json({ message: "Mail gönderilemedi." });
  }
}
