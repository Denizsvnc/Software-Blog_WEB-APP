import express from 'express';
import cors from 'cors';
import path from 'path';
// TypeScript tipleri için "import type" kullanımı (Modern standart)
import type { Express, Request, Response } from 'express';

// --- ROUTE DOSYALARI ---
// Not: ESM (type: module) kullandığımız için importlarda .js uzantısı zorunludur.
import authRoutes from './Routes/authRoutes.js';
import postRoutes from './Routes/postRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import uploadRoutes from './Routes/uploadRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import newsletterRoutes from './Routes/newsletterRoutes.js';

const app: Express = express();

// --- GLOBAL MIDDLEWARES ---

// 1. CORS: Frontend (Next.js) ile Backend'in konuşmasını sağlar
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'https://software-blogweb-app-production.up.railway.app' 
  ],
  credentials: true
}));

// 2. JSON Parser: Gelen isteklerin body kısmındaki JSON verisini okur
app.use(express.json());

// 3. Static Files: Yüklenen resimlerin tarayıcıdan erişilebilir olmasını sağlar
// Örnek: http://localhost:3000/uploads/1723456-resim.jpg
// process.cwd() projenin ana dizinini verir.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// --- API ROTALARI (ENDPOINTS) ---

// Kimlik Doğrulama (Kayıt, Giriş, Mail Doğrulama)
app.use('/api/auth', authRoutes);

// Blog İçerikleri (Makaleler, Yorumlar, Beğeniler)
app.use('/api/posts', postRoutes);

// Kategoriler
app.use('/api/categories', categoryRoutes);

// Kullanıcı İşlemleri (Profil Görüntüleme/Güncelleme)
app.use('/api/users', userRoutes);

// Dosya Yükleme (Resim Upload)
app.use('/api/upload', uploadRoutes);

// Yönetici İşlemleri (İstatistikler, Banlama)
app.use('/api/admin', adminRoutes);

// Bülten abonelikleri
app.use('/api/newsletter', newsletterRoutes);


// --- SAĞLIK KONTROLÜ (Health Check) ---
// Sunucunun çalışıp çalışmadığını anlamak için basit bir rota
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: '🚀 API Sistemleri sorunsuz çalışıyor!',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

export default app;