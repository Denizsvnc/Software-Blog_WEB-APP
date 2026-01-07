import type { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Lütfen bir resim seçin.' });
      return;
    }

    // Frontend'in erişeceği URL'i oluşturuyoruz
    // Örn: http://localhost:3000/uploads/123123-resim.jpg
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      message: 'Resim yüklendi.',
      url: fullUrl // Bu URL'i veritabanına kaydedeceksin (avatarUrl vb.)
    });
  } catch (error) {
    res.status(500).json({ error: 'Resim yükleme hatası.' });
  }
};