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

const app = express();

// Security headers — CSP disabled for API server (CSP applies to HTML pages, not JSON APIs)
// Other protections (X-Frame-Options, X-Content-Type-Options, etc.) remain active
app.use(helmet({
  contentSecurityPolicy: false,         // Not needed for a JSON API
  crossOriginEmbedderPolicy: false,     // Allows frontend to load assets normally
}));

// Restrict CORS to the configured frontend origin only
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Limit body size to 2MB to prevent DoS via huge payloads
app.use(express.json({ limit: '2mb' }));

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
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

export default app;
