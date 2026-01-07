import { Router } from 'express';
import { getAllCategories, createCategory } from '../Controllers/categoryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js'; 

const router = Router();

router.get('/', getAllCategories);


router.post('/', authenticateToken, isAdmin, createCategory);

export default router;