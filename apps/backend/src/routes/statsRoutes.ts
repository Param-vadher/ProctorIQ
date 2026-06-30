import { Router } from 'express';
import { getPublicStats } from '../controllers/statsController';

const router = Router();

// Public: Get real-time stats for the landing page
router.get('/public/stats', getPublicStats);

export default router;
