import express from 'express';
import { createAnnouncement, getUnreadAnnouncements, markAsRead, getAllAnnouncements } from '../controllers/announcementController';
import { authMiddleware as protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/unread', getUnreadAnnouncements);
router.post('/:id/read', markAsRead);
router.get('/mine', getAllAnnouncements);
router.post('/', createAnnouncement);

export default router;
