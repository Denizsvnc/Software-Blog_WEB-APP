import { Router } from 'express';
import { register, login, verifyEmail, resendVerification, getMe } from '../Controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', authenticateToken, getMe);

export default router;