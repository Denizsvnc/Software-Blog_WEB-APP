import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Node.js'in kendi kütüphanesi
import { prisma } from '../lib/prisma.js'; // Prisma client bağlantımız
import { sendVerificationEmail } from '../Services/emailService.js';

// ------------------------------------------------------------------
// 1. KULLANICI KAYIT (REGISTER)
// ------------------------------------------------------------------
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // A. Temel Validasyon
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Lütfen tüm alanları doldurunuz (username, email, password).' });
      return;
    }

    // B. Kullanıcı Zaten Var mı? (Email veya Username kontrolü)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      // Mevcut kullanıcı var ve email doğrulanmamışsa yeniden kod gönder, kaydı durdur
      if (!existingUser.emailVerified) {
        const emailToken = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Önce eski tokenları temizle
        await prisma.verificationToken.deleteMany({
          where: {
            identifier: email,
            type: 'EMAIL_VERIFICATION'
          }
        });

        // Yeni token oluştur
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token: emailToken,
            expires: expiresAt,
            type: 'EMAIL_VERIFICATION'
          }
        });

        // Mail gönder (hata olsa bile kaydı durduruyoruz)
        try {
          console.log(`📨 Doğrulama kodu tekrar gönderiliyor: ${email}`);
          await sendVerificationEmail(email, emailToken);
        } catch (mailError) {
          console.error('❌ Mail servisi hatası (tekrar gönder):', mailError);
        }

        res.status(400).json({
          error: 'Bu e-posta için hesap oluşturulmuş fakat doğrulanmamış. Lütfen e-postanıza gönderilen kodu kullanarak doğrulayın.'
        });
        return;
      }

      res.status(400).json({ error: 'Bu e-posta adresi veya kullanıcı adı zaten kullanımda.' });
      return;
    }

    // C. Şifreyi Hashle (Güvenlik)
    const hashedPassword = await bcrypt.hash(password, 10);

    // D. Kullanıcıyı Veritabanında Oluştur
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER', // Varsayılan rol
      }
    });

    // E. Email Doğrulama Kodu Oluştur (OTP)
    const emailToken = crypto.randomInt(100000, 999999).toString(); // 6 haneli kod
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Şu an + 15 dakika

    console.log('📧 Email Doğrulama Kodu:', emailToken); // Debug için konsola yazdır

    // Token'ı veritabanına kaydet (SADECE BİR KERE)
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: emailToken,
        expires: expiresAt,
        type: 'EMAIL_VERIFICATION'
      }
    });

    // F. Mail Gönderme İşlemi
    try {
      console.log(`📨 Mail gönderiliyor: ${email}`);
      await sendVerificationEmail(email, emailToken);
      console.log('✅ Mail başarıyla gönderildi');
    } catch (mailError) {
      console.error("❌ Mail servisi hatası:", mailError);
      // Mail gitmese bile kayıt başarılı sayılır, kullanıcı tekrar kod isteyebilir.
    }

    // G. Başarılı Yanıt (SADECE BİR KERE)
    res.status(201).json({
      message: 'Kayıt başarılı! Lütfen e-postanıza gönderilen doğrulama kodunu giriniz.',
      userId: user.id
    });

  } catch (error) {
    console.error('Register Hatası:', error);
    // Eğer daha önce yanıt gönderilmediyse hata mesajı dön
    if (!res.headersSent) {
      res.status(500).json({ error: 'Sunucu tarafında bir hata oluştu.' });
    }
  }
};

// ------------------------------------------------------------------
// 2. KULLANICI GİRİŞ (LOGIN)
// ------------------------------------------------------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📌 Login request received:', { body: req.body });
    const { email, password } = req.body;

    // A. Validasyon
    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      res.status(400).json({ error: 'Email ve şifre zorunludur.' });
      return;
    }

    // B. Kullanıcıyı Bul
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      res.status(400).json({ error: 'Kullanıcı bulunamadı veya bilgiler hatalı.' });
      return;
    }

    // C. Şifreyi Kontrol Et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      res.status(400).json({ error: 'Hatalı şifre.' });
      return;
    }

    // E. Email doğrulanmış mı?
    if (!user.emailVerified) {
      console.log('❌ Email not verified for user:', email);
      res.status(403).json({ error: 'Email doğrulanmamış. Lütfen e-postanıza gelen kodu girin.' });
      return;
    }

    // D. JWT Token Oluştur
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('HATA: .env dosyasında JWT_SECRET tanımlı değil!');
      res.status(500).json({ error: 'Sunucu konfigürasyon hatası.' });
      return;
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role 
      },
      secret,
      { expiresIn: '7d' }
    );

    // E. Başarılı Yanıt
    res.status(200).json({
      message: 'Giriş başarılı.',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error('Login Hatası:', error);
    res.status(500).json({ error: 'Sunucu tarafında bir hata oluştu.' });
  }
};
// ------------------------------------------------------------------
// 3. EMAIL DOĞRULAMA (VERIFY EMAIL)
// ------------------------------------------------------------------
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email ve kod gereklidir.' });
      return;
    }

    // 1. Veritabanında bu token var mı?
    const validToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        type: 'EMAIL_VERIFICATION' // Sadece email doğrulama kodlarına bak
      }
    });

    if (!validToken) {
      res.status(400).json({ error: 'Geçersiz kod.' });
      return;
    }

    // 2. Kodun süresi dolmuş mu?
    if (new Date() > validToken.expires) {
      // Süresi dolmuş tokenı temizle
      await prisma.verificationToken.delete({ where: { id: validToken.id } });
      res.status(400).json({ error: 'Kodun süresi dolmuş. Lütfen tekrar kayıt olun veya yeni kod isteyin.' });
      return;
    }

    // 3. Kullanıcıyı Güncelle (Doğrulandı olarak işaretle)
    await prisma.user.update({
      where: { email: email },
      data: { emailVerified: new Date() }
    });

    // 4. Token'ı sil (Tek kullanımlık olduğu için)
    await prisma.verificationToken.delete({
      where: { id: validToken.id }
    });

    res.status(200).json({ message: 'Hesap başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' });

  } catch (error) {
    console.error('Verify Error:', error);
    res.status(500).json({ error: 'Doğrulama işlemi başarısız.' });
  }
};

// ------------------------------------------------------------------
// 4. DOĞRULAMA KODUNU TEKRAR GÖNDER
// ------------------------------------------------------------------
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email gereklidir.' });
      return;
    }

    // Kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(400).json({ error: 'Kullanıcı bulunamadı.' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'Email zaten doğrulanmış.' });
      return;
    }

    // Eski tokenları sil
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: 'EMAIL_VERIFICATION'
      }
    });

    // Yeni token oluştur
    const emailToken = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: emailToken,
        expires: expiresAt,
        type: 'EMAIL_VERIFICATION'
      }
    });

    // Mail gönder
    try {
      await sendVerificationEmail(email, emailToken);
    } catch (mailError) {
      console.error("Mail servisi hatası:", mailError);
    }

    res.status(200).json({ message: 'Doğrulama kodu tekrar gönderildi.' });

  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({ error: 'Kod gönderilemedi.' });
  }
};

// ------------------------------------------------------------------
// 5. MEVCUT KULLANICI BİLGİSİ GETIR (ME)
// ------------------------------------------------------------------
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkisiz işlem.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı.' });
  }
};