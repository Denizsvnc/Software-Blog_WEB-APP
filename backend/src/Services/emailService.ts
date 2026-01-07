import nodemailer from 'nodemailer';
import dns from 'node:dns';

// 1. DNS FIX (Node 17+ IPv6 sorunu için)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.log("DNS ayarı yapılamadı veya gerekmedi.");
}

// Env Kontrol
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("🚨 KRİTİK HATA: SMTP_USER veya SMTP_PASS eksik!");
    // Uygulamanın çökmemesi için process.exit yapmıyoruz ama logluyoruz.
}

// 2. TRANSPORTER
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Standart host
    port: 587,
    secure: false, // Port 587 için false (STARTTLS kullanılır)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // DİKKAT: Burada Gmail "Uygulama Şifresi" kullanılmalı
    },
    tls: {
        ciphers: 'SSLv3', // Bazen eski protokol sorunları için gerekebilir ama genelde opsiyoneldir.
        rejectUnauthorized: true // GÜVENLİK İÇİN TRUE OLMALI (Veya satırı tamamen silin)
    },
    // Nodemailer'ın standart tip tanımlarında 'family' olmayabilir ama altyapı destekler.
    // 'as any' yerine specific casting yapılabilir veya olduğu gibi bırakılabilir.
    family: 4, 
} as nodemailer.TransportOptions); 

// --- Bağlantı Testi ---
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ MAIL SUNUCUSU BAĞLANTI HATASI:", error);
    } else {
        console.log("✅ MAIL SUNUCUSU HAZIR (IPv4 Modu Aktif)");
    }
});

// Ortak Gönderici İsmi
const SENDER_IDENTITY = `"Yazılım Blog Forum" <${process.env.SMTP_USER}>`;

// 3. DOĞRULAMA MAİLİ
export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
  try {
    const mailOptions = {
      from: SENDER_IDENTITY,
      to: to,
      subject: 'Hesap Doğrulama Kodu',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Hoş Geldiniz!</h2>
          <p style="color: #666; font-size: 16px; text-align: center;">
            Kayıt işleminizi tamamlamak için kodunuz:
          </p>
          <div style="background-color: #f0f7ff; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #007bff; border-radius: 6px; margin: 20px 0; border: 1px dashed #007bff;">
            ${code}
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">
            Bu kod 15 dakika geçerlidir.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Doğrulama maili gönderildi: ${info.messageId}`);

  } catch (error: any) {
    console.error(`❌ Mail Hatası (Kime: ${to}):`, error.message);
    // Hatanın yukarı fırlatılması, API'nin kullanıcıya hata dönmesi için önemlidir.
    throw new Error('Mail servisi yanıt vermedi.'); 
  }
};

// 4. BÜLTEN MAİLİ
export const sendNewsletterEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await transporter.sendMail({ 
        from: SENDER_IDENTITY, // İsimli gönderici kullanıldı
        to, 
        subject, 
        html 
    });
    console.log(`✅ Bülten gönderildi: ${to}`);
  } catch (error: any) {
    console.error('❌ Bülten hatası:', error.message);
    throw new Error('Bülten gönderilemedi.');
  }
};