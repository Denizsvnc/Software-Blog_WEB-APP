import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

// ... createPost ve getAllPosts fonksiyonları aynı kalacak ...
// (Sadece hata veren fonksiyonları aşağıya yazıyorum)

export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, categoryIds, imageUrls = [], videoUrls = [] } = req.body;
      const userId = req.user?.userId; 
  
      if (!userId) {
         res.status(401).json({ error: 'Yetkisiz işlem.' });
         return;
      }

      if (!title || !content) {
        res.status(400).json({ error: 'Başlık ve içerik zorunludur.' });
        return;
      }
  
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
  
      const createData: any = {
        title,
        content,
        slug,
        authorId: userId,
        published: true,
        imageUrls: Array.isArray(imageUrls) ? imageUrls.filter((url: any) => url && typeof url === 'string') : [],
        videoUrls: Array.isArray(videoUrls) ? videoUrls.filter((url: any) => url && typeof url === 'string') : []
      };

      // Only add categories if there are any
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        createData.categories = {
          connect: categoryIds.map((id: string) => ({ id }))
        };
      }
  
      const post = await prisma.post.create({
        data: createData,
        include: {
          author: { select: { username: true, avatarUrl: true } },
          categories: true,
          _count: { select: { likes: true, comments: true } }
        }
      });
  
      res.status(201).json(post);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Makale oluşturulamadı.' });
    }
  };

  export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { author, authorId, category, sort } = req.query as {
        author?: string;
        authorId?: string;
        category?: string;
        sort?: string;
      };

      const where: Prisma.PostWhereInput = {
        published: true
      };

      if (authorId) {
        where.authorId = authorId;
      } else if (author) {
        where.author = { username: author };
      }

      if (category) {
        where.categories = {
          some: {
            OR: [
              { slug: category },
              { id: category }
            ]
          }
        };
      }
      let orderByOption: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[];

      if (sort === 'popular') {
        orderByOption = [
          { likes: { _count: 'desc' } },
          { comments: { _count: 'desc' } },
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ];
      } else {
        orderByOption = { createdAt: 'desc' };
      }

      const posts = await prisma.post.findMany({
        where,
        orderBy: orderByOption,
        include: {
          author: { select: { username: true, avatarUrl: true } },
          categories: true,
          _count: { select: { likes: true, comments: true } }
        }
      });

      res.json(posts);
    } catch (error) {
      console.error('❌ Error in getAllPosts:', error);
      res.status(500).json({ error: 'Makaleler yüklenemedi.' });
    }
  };

// 3. Tekil Makale Detayı
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    // KESİN KONTROL: Slug yoksa hata ver
    if (!slug) {
        res.status(400).json({ error: 'Slug parametresi eksik.' });
        return;
    }

    const post = await prisma.post.update({
      where: { slug: slug }, // Artık slug'ın string olduğu kesin
      data: { viewCount: { increment: 1 } },
      include: {
        author: { select: { id: true, username: true, bio: true, avatarUrl: true } },
        categories: true,
        likes: {
          select: { userId: true }
        },
        comments: {
          include: { user: { select: { username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { likes: true } }
      }
    });

    res.json(post);
  } catch (error) {
    // Prisma kayıt bulamazsa hata fırlatır
    res.status(404).json({ error: 'Makale bulunamadı.' });
  }
};

// 4. Makale Sil
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // KESİN KONTROL: ID veya Kullanıcı yoksa dur
    if (!id || !userId) {
        res.status(400).json({ error: 'Geçersiz parametreler.' });
        return;
    }

    // Makale sahibini kontrol et
    const post = await prisma.post.findUnique({ where: { id: id } });

    if (!post || post.authorId !== userId) {
      res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
      return;
    }

    await prisma.post.delete({ where: { id: id } });
    res.json({ message: 'Makale silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Silme işlemi başarısız.' });
  }
};

// 5. Makale Güncelle (sadece sahibi)
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, categoryIds, imageUrls = [], videoUrls = [] } = req.body;
    const userId = req.user?.userId;

    if (!id || !userId) {
      res.status(400).json({ error: 'Geçersiz parametreler.' });
      return;
    }

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post || post.authorId !== userId) {
      res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
      return;
    }

    const newSlug = title
        ? title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now()
      : post.slug;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? post.title,
        content: content ?? post.content,
        slug: newSlug,
        imageUrls: Array.isArray(imageUrls) ? imageUrls.filter((url: any) => url && typeof url === 'string') : (post as any).imageUrls,
        videoUrls: Array.isArray(videoUrls) ? videoUrls.filter((url: any) => url && typeof url === 'string') : (post as any).videoUrls,
        ...(categoryIds && { categories: { set: categoryIds.map((cid: string) => ({ id: cid })) } })
      } as any,
      include: {
        author: { select: { username: true, avatarUrl: true } },
        categories: true,
        _count: { select: { likes: true, comments: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('❌ Error in updatePost:', error);
    res.status(500).json({ error: 'Güncelleme başarısız.' });
  }
};

// 6. Kullanıcının kendi makaleleri
export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Giriş yapmalısınız.' });
      return;
    }

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: true,
        _count: { select: { likes: true, comments: true } }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('❌ Error in getMyPosts:', error);
    res.status(500).json({ error: 'Makaleler getirilemedi.' });
  }
};

// 7. Kategoriye göre makaleler (slug ile)
export const getPostsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.status(400).json({ error: 'Kategori slug gerekli.' });
      return;
    }

    const posts = await prisma.post.findMany({
      where: {
        published: true,
        categories: {
          some: { slug }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true, avatarUrl: true } },
        categories: true,
        _count: { select: { likes: true, comments: true } }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('❌ Error in getPostsByCategory:', error);
    res.status(500).json({ error: 'Makaleler getirilemedi.' });
  }
};