import { Router } from 'express';
import { subscribeNewsletter, unsubscribeNewsletter } from '../Controllers/newsletterController.js';

const router = Router();

router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

export default router;
