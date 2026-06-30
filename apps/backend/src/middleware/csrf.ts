import { doubleCsrf } from 'csrf-csrf';
import { config } from '../config';

const csrfConfig = doubleCsrf({
  getSecret: () => config.jwtSecret || 'super-secret', // In production, use a dedicated CSRF secret
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-psgo.x-csrf-token' : 'psgo.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getSessionIdentifier: (req) => req.cookies?.token || 'default', // Fallback for session identifier
});

export const doubleCsrfProtection = csrfConfig.doubleCsrfProtection;
export const generateToken = csrfConfig.generateCsrfToken;
