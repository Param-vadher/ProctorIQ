import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import statsRoutes from './routes/statsRoutes';
import messageRoutes from './routes/messageRoutes';
import announcementRoutes from './routes/announcementRoutes';
import { authMiddleware } from './middleware/authMiddleware';
import { adminMiddleware } from './middleware/adminMiddleware';
import { teacherMiddleware } from './middleware/teacherMiddleware';
import { setupSwagger } from './swagger';
import { ApiResponse } from './utils/ApiResponse';

import cookieParser from 'cookie-parser';
import { doubleCsrfProtection, generateToken } from './middleware/csrf';

const app = express();

// Security headers — CSP disabled for API server (CSP applies to HTML pages, not JSON APIs)
// Other protections (X-Frame-Options, X-Content-Type-Options, etc.) remain active
app.use(helmet({
  contentSecurityPolicy: false,         // Not needed for a JSON API
  crossOriginEmbedderPolicy: false,     // Allows frontend to load assets normally
}));

app.use(cookieParser());

import { config } from './config';

// Restrict CORS to the configured frontend origin only
app.use(cors({
  origin: config.frontendUrl || 'http://localhost:5173',
  credentials: true,
}));

// Limit body size to 2MB to prevent DoS via huge payloads
app.use(express.json({ limit: '2mb' }));

setupSwagger(app);

// Apply CSRF protection globally (ignored on GET/HEAD/OPTIONS, and public auth routes)
app.use((req, res, next) => {
  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next();
  }
  return doubleCsrfProtection(req, res, next);
});

app.get('/api/csrf-token', (req, res) => {
  return res.json({ csrfToken: generateToken(req, res) });
});

app.use('/api', inquiryRoutes); // Contains both public and admin routes with own middleware
app.use('/api', statsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
app.use('/api/teacher', authMiddleware, teacherMiddleware, teacherRoutes);
app.use('/api/student', authMiddleware, studentRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err.stack);
  } else {
    console.error(`[Error] ${err.name}: ${err.message}`);
  }
  
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Something went wrong!';
  const data = process.env.NODE_ENV !== 'production' ? { stack: err.stack } : undefined;
  
  ApiResponse.error(res, message, err.status || 500, data);
});

export default app;
