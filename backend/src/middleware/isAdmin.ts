import type { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  
  const user = req.user;

  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Erişim reddedildi. Bu işlem sadece yöneticiler içindir.' });
    return;
  }

  next();
};