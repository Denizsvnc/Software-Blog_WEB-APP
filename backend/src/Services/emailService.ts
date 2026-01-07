import nodemailer from 'nodemailer';
import dns from 'node:dns';

// 1. DNS ÇÖZÜMLEME AYARI (Railway için Kritik)
// IPv6 bağlantı zaman aşımlarını önlemek için IPv4'ü zorluyoruz.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Lokal ortamda hata verirse yoksay
}

// 2. TRANSPORTER AYARLARI (GMAIL SERVİSİ)
// 'host', 'port' ve 'secure' yerine doğrudan 'service: gmail' kullanıyoruz.
// Bu, ETIMEDOUT hatasının kesin çözümüdür.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Doğrudan host adresi
    port: 587,               // 587 TLS portu (Daha kararlı)
    secure: false,           // 587 için MUTLAKA false olmalı
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false  // Sertifika hatalarını görmezden gel
    },
    connectionTimeout: 40000, // 10 saniye bekle
    greetingTimeout: 10000    // Selamlaşma süresi
});

// --- DEBUG LOGLARI (Sadece başlangıçta çalışır) ---
console.log("--- EMAIL SERVICE BAŞLATILIYOR ---");
console.log("KULLANICI:", process.env.SMTP_USER ? process.env.SMTP_USER : "YOK (HATA!)");
console.log("ŞİFRE DURUMU:", process.env.SMTP_PASS ? "YÜKLÜ" : "YOK (HATA!)");
console.log("----------------------------------");

// 3. DOĞRULAMA MAİLİ GÖNDERME
export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
  try {
    console.log(`📨 Mail gönderimi başlatılıyor: ${to}`);

    const mailOptions = {
      from: `"Yazılım Blog Forum" <${process.env.SMTP_USER}>`,
      to: to,
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

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Doğrulama maili başarıyla gönderildi! ID: ${info.messageId}`);

  } catch (error: any) {
    console.error('❌ Mail gönderme hatası (DETAYLI):');
    console.error(`- Hata Kodu: ${error.code}`);
    console.error(`- Hata Mesajı: ${error.message}`);
    // Hatayı fırlatıyoruz ki Controller yakalayabilsin
    throw new Error('Email servisi çalışmadı: ' + error.message);
  }
};

// 4. BÜLTEN MAİLİ GÖNDERME
export const sendNewsletterEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    console.log(`📨 Bülten gönderimi başlatılıyor: ${to}`);
    
    const info = await transporter.sendMail({
      from: `"Yazılım Blog Forum" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✅ Bülten maili gönderildi: ${info.messageId}`);
  } catch (error: any) {
    console.error('❌ Bülten maili hatası:', error.message);
    throw new Error('Bülten maili gönderilemedi.');
  }
};