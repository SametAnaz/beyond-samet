// pages/api/contact.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Yalnızca POST metoduna izin var." });
    }
  
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Eksik alan var." });
    }
  
    // Mailgun kodunuz vs burada kalsın...
    res.status(200).json({ message: "Mail başarıyla gönderildi." });
  }
  