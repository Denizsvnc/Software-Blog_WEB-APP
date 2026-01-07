import nodemailer from 'nodemailer';
import dns from 'node:dns';

// 1. DNS FIX
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.log("DNS ayarı atlandı.");
}

// Env Kontrol
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("🚨 KRİTİK HATA: SMTP_USER veya SMTP_PASS eksik!");
}

// 2. TRANSPORTER (KESİN ÇÖZÜM)
// "as any" kullanarak TypeScript'in "host özelliği yok" ağlamasını susturuyoruz.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4, // IPv4 Zorlaması (ETIMEDOUT Çözümü)
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
} as any); // <--- İŞTE SİHİRLİ DOKUNUŞ BURADA ("as any")

// --- Bağlantı Testi ---
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ MAIL SUNUCUSU BAĞLANTI HATASI:", error);
    } else {
        console.log("✅ MAIL SUNUCUSU HAZIR (IPv4 Modu)");
    }
});

// 3. DOĞRULAMA MAİLİ FONKSİYONU
export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
  try {
    console.log(`📨 Mail gönderiliyor: ${to}`);

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
            Bu kod 15 dakika boyunca geçerlidir.
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
    throw new Error('Email servisi çalışmadı: ' + error.message);
  }
};

// 4. BÜLTEN MAİLİ FONKSİYONU
export const sendNewsletterEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
    console.log(`✅ Bülten gönderildi: ${to}`);
  } catch (error: any) {
    console.error('❌ Bülten hatası:', error.message);
    throw new Error('Bülten maili gönderilemedi.');
  }
};