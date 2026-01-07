import nodemailer from 'nodemailer';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first'); 
// Transporter (Taşıyıcı) Oluşturma
// Bu ayarlar .env dosyasından gelir
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // 465 portu için true, 587 için false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Doğrulama Maili Gönderme Fonksiyonu
export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
  try {
    const mailOptions = {
      from: `"Yazılım Blog Forum" <${process.env.SMTP_USER}>`, // Gönderen Adı
      to: to, // Alıcı (Register formundan gelen)
      subject: 'Hesap Doğrulama Kodu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Hoş Geldiniz!</h2>
          <p style="color: #555; font-size: 16px;">
            Merhaba, kayıt işleminizi tamamlamak için lütfen aşağıdaki doğrulama kodunu kullanın.
          </p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2d89ef; border-radius: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            Bu kod 15 dakika boyunca geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu maili dikkate almayınız.
          </p>
        </div>
      `,
    };

    // Maili gönder
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Mail gönderildi: ${info.messageId}`);

  } catch (error) {
    console.error('❌ Mail gönderme hatası:', error);
    // Hata olsa bile kullanıcıya "Mail gönderilemedi" hatası döndürmek yerine
    // loglayıp süreci devam ettirebiliriz veya throw ile hatayı yukarı fırlatabiliriz.
    throw new Error('Email servisi çalışmadı.');
  }
};

export const sendNewsletterEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: `"Yazılım Blog Forum" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✅ Bülten maili gönderildi: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Bülten maili gönderilemedi:', error);
    throw new Error('Bülten maili gönderilemedi.');
  }
};