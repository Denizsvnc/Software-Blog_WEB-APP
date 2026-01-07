import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Token'ı Header'dan al (Format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Token yoksa içeri alma
  if (!token) {
    res.status(401).json({ error: 'Erişim reddedildi. Token bulunamadı.' });
    return;
  }

  // 3. Token'ı doğrula
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET .env dosyasında tanımlı değil!");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // 4. Token geçerliyse, içindeki bilgiyi req objesine yapıştır
    req.user = decoded; 
    
    // 5. Bir sonraki aşamaya geç (Controller'a git)
    next();
  } catch (error) {
    res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
};