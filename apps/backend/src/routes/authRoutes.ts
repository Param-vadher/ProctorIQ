import { Router } from 'express';
import { register, login, logout, getProfile, updateProfile, changePassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';
import { validateData } from '../middleware/validateData';
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } from '../validations/auth.validation';

const router = Router();

// Max 20 login/register attempts per 15 minutes per IP (protects against brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateData(registerSchema), register);
router.post('/login', authLimiter, validateData(loginSchema), login);
router.post('/logout', logout);

// Profile Management (Requires Authentication)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateData(updateProfileSchema), updateProfile);
router.put('/change-password', authMiddleware, validateData(changePasswordSchema), changePassword);

export default router;
