import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Public Profil (Kullanıcı adına göre)
export const getProfileByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Kullanıcı adı gerekli.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: { posts: true, comments: true }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Profil yüklenemedi.' });
  }
};

// Profil Bilgilerini Getir
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // KESİN KONTROL: userId yoksa işlem yapma
    if (!userId) {
      res.status(401).json({ error: 'Giriş yapmalısınız.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }, // Artık userId'nin string olduğundan eminiz
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: { posts: true, comments: true, likes: true }
        }
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Profil yüklenemedi.' });
  }
};

// Profil Güncelle
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bio, avatarUrl, name, username, email } = req.body;

    // KESİN KONTROL
    if (!userId) {
      res.status(401).json({ error: 'Giriş yapmalısınız.' });
      return;
    }

    // Benzersizlik kontrolleri (eğer alan değişiyorsa)
    if (username) {
      const exists = await prisma.user.findFirst({ where: { username, NOT: { id: userId } } });
      if (exists) {
        res.status(400).json({ error: 'Kullanıcı adı kullanımda.' });
        return;
      }
    }
    if (email) {
      const exists = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
      if (exists) {
        res.status(400).json({ error: 'E-posta kullanımda.' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bio, avatarUrl, name, username, email },
      select: { id: true, username: true, email: true, name: true, bio: true, avatarUrl: true, role: true, status: true, emailVerified: true }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Güncelleme başarısız.' });
  }
};