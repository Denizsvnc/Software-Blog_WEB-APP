import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Klasör Kontrolü - yoksa olustur
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Depolama Ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Dosyalar 'uploads' klasörüne gitsin
  },
  filename: (req, file, cb) => {
    // Dosya adı çakışmasın diye tarih ekliyoruz: "172435...-resim.jpg"
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. Dosya Filtresi (Sadece Resimler)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!')); // Hata fırlat
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Maksimum 5MB
});