import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Tüm kategorileri getir
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { posts: true } } // Hangi kategoride kaç yazı var?
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler getirilemedi.' });
  }
};

// Yeni kategori oluştur (Sadece Admin yapabilmeli ama şimdilik açık bırakıyoruz)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    // Basit slug oluşturma: "Yazılım Dünyası" -> "yazilim-dunyasi"
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const category = await prisma.category.create({
      data: { name, slug, description }
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Kategori oluşturulamadı (İsim benzersiz olmalı).' });
  }
};