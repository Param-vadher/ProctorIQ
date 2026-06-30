import { Router } from 'express';
import { submitInquiry, getInquiries, replyToInquiry, submitAuthInquiry, getAuthInquiries, getReceivedInquiries } from '../controllers/inquiryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Public: Submit inquiry
router.post('/public/contact', submitInquiry);

// Auth User: Internal messaging
router.post('/inquiries/me', authMiddleware, submitAuthInquiry);
router.get('/inquiries/me', authMiddleware, getAuthInquiries);
router.get('/inquiries/received', authMiddleware, getReceivedInquiries);

// Admin & Teachers: Manage inquiries
router.get('/admin/inquiries', authMiddleware, adminMiddleware, getInquiries);
router.post('/inquiries/:id/reply', authMiddleware, replyToInquiry);

export default router;
