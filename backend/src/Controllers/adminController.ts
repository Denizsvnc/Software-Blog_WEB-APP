import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

// Kullanıcı Durumunu Güncelle (Banla / Aktif Et)
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // "BANNED" veya "ACTIVE"

    if (!userId) {
      res.status(400).json({ error: 'Kullanıcı ID eksik.' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: status }
    });

    res.json({ message: `Kullanıcı durumu ${status} olarak güncellendi.` });
  } catch (error) {
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
};

// Admin Paneli İstatistikleri
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [userCount, postCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count()
    ]);

    res.json({
      totalUsers: userCount,
      totalPosts: postCount,
      totalComments: commentCount
    });
  } catch (error) {
    res.status(500).json({ error: 'İstatistikler alınamadı.' });
  }
};

// Tüm kullanıcıları getir
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcılar getirilemedi.' });
  }
};

// Kullanıcı rolünü güncelle
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body as { role?: 'ADMIN' | 'EDITOR' | 'USER' };

    if (!userId || !role) {
      res.status(400).json({ error: 'Kullanıcı ID ve rol gereklidir.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    res.json({ message: 'Kullanıcı rolü güncellendi.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Rol güncellenemedi.' });
  }
};

// Kategorileri listele
export const getAllCategoriesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { posts: true } }
      }
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler getirilemedi.' });
  }
};

// Yeni kategori oluştur
export const createCategoryAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Kategori adı gereklidir.' });
      return;
    }

    const slug = slugify(name);

    const category = await prisma.category.create({
      data: { name, description, slug }
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Kategori oluşturulamadı.' });
  }
};

// Kategori güncelle
export const updateCategoryAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body as { name?: string; description?: string };

    if (!categoryId) {
      res.status(400).json({ error: 'Kategori ID gereklidir.' });
      return;
    }

    const data: { name?: string; description?: string; slug?: string } = {};

    if (name) {
      data.name = name;
      data.slug = slugify(name);
    }

    if (typeof description === 'string') {
      data.description = description;
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data
    });

    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Kategori güncellenemedi.' });
  }
};

// Kategori sil
export const deleteCategoryAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      res.status(400).json({ error: 'Kategori ID gereklidir.' });
      return;
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.json({ message: 'Kategori silindi.' });
  } catch (error) {
    res.status(400).json({ error: 'Kategori silinemedi. Kategoride makale var olabilir.' });
  }
};

// Tüm makaleleri listele
export const getAllPostsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        categories: true,
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Makaleler getirilemedi.' });
  }
};

// Makalenin yayın durumunu güncelle
export const updatePostPublishStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { published } = req.body as { published?: boolean };

    if (!postId || typeof published !== 'boolean') {
      res.status(400).json({ error: 'Makale ID ve yayın durumu gereklidir.' });
      return;
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { published }
    });

    res.json({ message: 'Makale durumu güncellendi.', post });
  } catch (error) {
    res.status(400).json({ error: 'Makale güncellenemedi.' });
  }
};

// Makaleyi sil (admin)
export const deletePostAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    if (!postId) {
      res.status(400).json({ error: 'Makale ID gereklidir.' });
      return;
    }

    await prisma.post.delete({ where: { id: postId } });

    res.json({ message: 'Makale silindi.' });
  } catch (error) {
    res.status(400).json({ error: 'Makale silinemedi.' });
  }
};