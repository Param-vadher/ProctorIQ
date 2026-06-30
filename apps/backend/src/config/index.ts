import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`\x1b[31m[CRITICAL] Missing required environment variables: ${missingEnvVars.join(', ')}\x1b[0m`);
  console.error('\x1b[31mPlease check your .env file or deployment configuration.\x1b[0m');
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  frontendUrl: process.env.FRONTEND_URL as string,
  geminiApiKey: process.env.GEMINI_API_KEY as string,
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,

  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
};
