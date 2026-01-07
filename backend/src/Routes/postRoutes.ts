import { Router } from 'express';
import { createPost, getAllPosts, getPostBySlug, deletePost, updatePost, getMyPosts, getPostsByCategory } from '../Controllers/postController.js';
import { createComment, toggleLike } from '../Controllers/interactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Herkese açık rotalar
router.get('/', getAllPosts);
router.get('/category/:slug', getPostsByCategory);

// Giriş gerektiren rotalar
router.get('/mine', authenticateToken, getMyPosts);
router.get('/:slug', getPostBySlug);
router.post('/', authenticateToken, createPost);
router.patch('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

// Etkileşimler (Yorum ve Like)
router.post('/comment', authenticateToken, createComment); 
router.post('/like', authenticateToken, toggleLike);       

export default router;