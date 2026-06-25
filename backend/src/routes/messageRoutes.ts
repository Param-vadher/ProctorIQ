import express from 'express';
import { getContacts, getMessages, sendMessage } from '../controllers/messageController';
import { authMiddleware as protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/contacts', getContacts);
router.get('/:userId', getMessages);
router.post('/send', sendMessage);

export default router;
