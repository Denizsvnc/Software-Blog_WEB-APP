import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendNewsletterEmail } from '../Services/emailService.js';

const normalizeEmail = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      res.status(400).json({ error: 'Geçerli bir e-posta adresi gerekli.' });
      return;
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existing) {
      if (existing.unsubscribed) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { unsubscribed: false, unsubscribedAt: null }
        });
        res.json({ message: 'Bülten aboneliğiniz yeniden aktifleştirildi.' });
        return;
      }

      res.status(200).json({ message: 'Zaten bültene abonesiniz.' });
      return;
    }

    await prisma.newsletterSubscriber.create({
      data: { email }
    });

    res.status(201).json({ message: 'Bülten aboneliği başarıyla tamamlandı.' });
  } catch (error) {
    res.status(500).json({ error: 'Abonelik işlemi sırasında bir hata oluştu.' });
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      res.status(400).json({ error: 'Geçerli bir e-posta adresi gerekli.' });
      return;
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (!subscriber || subscriber.unsubscribed) {
      res.status(200).json({ message: 'Abonelik zaten pasif.' });
      return;
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { unsubscribed: true, unsubscribedAt: new Date() }
    });

    res.json({ message: 'Bülten aboneliğiniz iptal edildi.' });
  } catch (error) {
    res.status(500).json({ error: 'Abonelik iptal edilirken bir hata oluştu.' });
  }
};

export const getNewsletterSubscribers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' }
    });

    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: 'Abone listesi alınamadı.' });
  }
};

export const updateNewsletterSubscriberStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriberId } = req.params;
    const { unsubscribed } = req.body as { unsubscribed?: boolean };

    if (!subscriberId || typeof unsubscribed !== 'boolean') {
      res.status(400).json({ error: 'Geçerli bir abone bilgisi gerekli.' });
      return;
    }

    const result = await prisma.newsletterSubscriber.update({
      where: { id: subscriberId },
      data: {
        unsubscribed,
        unsubscribedAt: unsubscribed ? new Date() : null
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Abone durumu güncellenemedi.' });
  }
};

export const sendNewsletterCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';

    if (!subject || !body) {
      res.status(400).json({ error: 'Konu ve içerik zorunludur.' });
      return;
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { unsubscribed: false }
    });

    if (!subscribers.length) {
      res.status(200).json({ message: 'Aktif abone bulunmadığı için kampanya gönderilmedi.' });
      return;
    }

    // Kampanya iletimini tek transaction altında izleriz
    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject,
        body,
        recipientCount: subscribers.length,
        sentAt: new Date()
      }
    });

    for (const subscriber of subscribers) {
      await sendNewsletterEmail(subscriber.email, subject, body);
    }

    await prisma.newsletterCampaignSubscriber.createMany({
      data: subscribers.map((subscriber) => ({
        campaignId: campaign.id,
        subscriberId: subscriber.id,
        sentAt: new Date()
      }))
    });

    res.json({ message: 'Kampanya gönderildi.', campaignId: campaign.id });
  } catch (error) {
    res.status(500).json({ error: 'Kampanya gönderimi başarısız oldu.' });
  }
};
