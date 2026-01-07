import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadImage } from '../Controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, upload.single('file'), uploadImage);

export default router;