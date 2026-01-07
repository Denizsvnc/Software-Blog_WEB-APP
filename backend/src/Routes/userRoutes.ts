import { Router } from 'express';
import { getProfile, updateProfile, getProfileByUsername } from '../Controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Authentication required
router.get('/me', authenticateToken, getProfile);
router.put('/me', authenticateToken, updateProfile);

// Public route - no auth needed
router.get('/:username', getProfileByUsername);

export default router;