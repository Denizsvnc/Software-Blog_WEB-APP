import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Yorum Yap
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({error: "Giriş yapmalısınız"});
        return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId
      },
      include: {
        user: { select: { username: true, avatarUrl: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Yorum yapılamadı.' });
  }
};

// Like Toggle (Varsa sil, yoksa ekle)
export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({error: "Giriş yapmalısınız"});
        return;
    }

    // Kullanıcı bu postu daha önce beğenmiş mi?
    // Prisma'da composite ID araması (userId_postId)
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingLike) {
      // Beğenmişse -> Beğeniyi Kaldır (Unlike)
      await prisma.like.delete({
        where: {
          userId_postId: { userId, postId }
        }
      });
      res.json({ message: 'Beğeni geri alındı.', liked: false });
    } else {
      // Beğenmemişse -> Beğeni Ekle (Like)
      await prisma.like.create({
        data: { userId, postId }
      });
      res.json({ message: 'Beğenildi.', liked: true });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};