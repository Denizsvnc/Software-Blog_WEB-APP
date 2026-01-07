import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { sendNewsletterEmail } from '../Services/emailService.js';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      res.status(400).json({ error: 'E-posta adresi gereklidir.' });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingSubscriber) {
      if (existingSubscriber.unsubscribed) {
        await prisma.newsletterSubscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            unsubscribed: false,
            unsubscribedAt: null,
            subscribedAt: new Date()
          }
        });
      }

      res.json({ message: 'Aboneliğiniz aktif durumda.' });
      return;
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail
      }
    });

    res.status(201).json({ message: 'Bültene başarıyla abone oldunuz.' });
  } catch (error) {
    res.status(500).json({ error: 'Abonelik işlemi gerçekleştirilemedi.' });
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      res.status(400).json({ error: 'E-posta adresi gereklidir.' });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail }
    });

    if (!subscriber) {
      res.status(404).json({ error: 'Bu e-posta adresi aboneler arasında bulunamadı.' });
      return;
    }

    if (subscriber.unsubscribed) {
      res.json({ message: 'Abonelik zaten pasif durumda.' });
      return;
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        unsubscribed: true,
        unsubscribedAt: new Date()
      }
    });

    res.json({ message: 'Abonelik sonlandırıldı.' });
  } catch (error) {
    res.status(500).json({ error: 'Abonelik sonlandırılamadı.' });
  }
};

export const getNewsletterSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
      include: {
        campaigns: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: { sentAt: true }
        }
      }
    });

    const enriched = subscribers.map((subscriber) => {
      const { campaigns, ...rest } = subscriber;
      return {
        ...rest,
        lastSentAt: campaigns[0]?.sentAt ?? null
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Abone listesi getirilemedi.' });
  }
};

export const sendNewsletterCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, message } = req.body as { subject?: string; message?: string };

    if (!subject || !message) {
      res.status(400).json({ error: 'Konu ve mesaj alanları gereklidir.' });
      return;
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { unsubscribed: false }
    });

    if (subscribers.length === 0) {
      res.status(400).json({ error: 'Aktif abonelik bulunmuyor.' });
      return;
    }

    const formattedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${message.replace(/\n/g, '<br />')}</p>
        <p style="font-size: 12px; color: #666; margin-top: 32px;">Bu e-postayı artık almak istemiyorsanız, lütfen aboneliğinizi sonlandırmak için bizimle iletişime geçin.</p>
      </div>
    `;

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject,
        body: message
      }
    });

    const failedRecipients: string[] = [];
    let deliveredCount = 0;

    for (const subscriber of subscribers) {
      try {
        await sendNewsletterEmail(subscriber.email, subject, formattedHtml);
        await prisma.newsletterCampaignSubscriber.create({
          data: {
            campaignId: campaign.id,
            subscriberId: subscriber.id
          }
        });
        deliveredCount += 1;
      } catch (error) {
        failedRecipients.push(subscriber.email);
      }
    }

    await prisma.newsletterCampaign.update({
      where: { id: campaign.id },
      data: {
        recipientCount: deliveredCount,
        sentAt: new Date()
      }
    });

    res.json({
      message: 'Bülten gönderimi tamamlandı.',
      delivered: deliveredCount,
      failed: failedRecipients
    });
  } catch (error) {
    res.status(500).json({ error: 'Bülten gönderimi başarısız oldu.' });
  }
};

export const updateNewsletterSubscriberStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriberId } = req.params as { subscriberId?: string };
    const { action } = req.body as { action?: 'unsubscribe' | 'resubscribe' | 'remove' };

    if (!subscriberId || !action) {
      res.status(400).json({ error: 'Abone ID ve işlem bilgisi gereklidir.' });
      return;
    }

    if (action === 'remove') {
      await prisma.newsletterSubscriber.delete({ where: { id: subscriberId } });
      res.json({ message: 'Abone silindi.' });
      return;
    }

    const updateData =
      action === 'unsubscribe'
        ? { unsubscribed: true, unsubscribedAt: new Date() }
        : { unsubscribed: false, unsubscribedAt: null, subscribedAt: new Date() };

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id: subscriberId },
      data: updateData
    });

    res.json({
      message: action === 'unsubscribe' ? 'Abonelik pasif hale getirildi.' : 'Abonelik yeniden aktifleştirildi.',
      subscriber
    });
  } catch (error) {
    res.status(500).json({ error: 'Abone bilgisi güncellenemedi.' });
  }
};
