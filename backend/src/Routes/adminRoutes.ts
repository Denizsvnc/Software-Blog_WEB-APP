import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import {
	updateUserStatus,
	getDashboardStats,
	getAllUsers,
	updateUserRole,
	getAllCategoriesAdmin,
	createCategoryAdmin,
	updateCategoryAdmin,
	deleteCategoryAdmin,
	getAllPostsAdmin,
	updatePostPublishStatus,
	deletePostAdmin
} from '../Controllers/adminController.js';
import {
	getNewsletterSubscribers,
	sendNewsletterCampaign,
	updateNewsletterSubscriberStatus
} from '../Controllers/newsletterController.js';

const router = Router();

// Önce giriş kontrolü yap, sonra admin mi diye bak
router.use(authenticateToken, isAdmin);

router.get('/stats', getDashboardStats);

// Kullanıcı yönetimi
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/role', updateUserRole);

// Kategori yönetimi
router.get('/categories', getAllCategoriesAdmin);
router.post('/categories', createCategoryAdmin);
router.put('/categories/:categoryId', updateCategoryAdmin);
router.delete('/categories/:categoryId', deleteCategoryAdmin);

// Makale yönetimi
router.get('/posts', getAllPostsAdmin);
router.put('/posts/:postId/published', updatePostPublishStatus);
router.delete('/posts/:postId', deletePostAdmin);

// Bülten yönetimi
router.get('/newsletter/subscribers', getNewsletterSubscribers);
router.post('/newsletter/campaigns', sendNewsletterCampaign);
router.patch('/newsletter/subscribers/:subscriberId', updateNewsletterSubscriberStatus);

export default router;