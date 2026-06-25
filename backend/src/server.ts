import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars explicitly from the backend root before importing anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import User from './models/User';
import bcrypt from 'bcryptjs';

// ── Fail fast if critical env vars are missing ──────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables. Refusing to start.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ProctorIQ_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Admin Seeder — credentials come from .env only, never hardcoded
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        console.warn('WARNING: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed.');
      } else {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
          const hashedPassword = await bcrypt.hash(adminPassword, 12);
          await User.create({
            name: 'System Administrator',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
          });
          console.log(`Default admin account created: ${adminEmail}`);
        }
      }
    } catch (err) {
      console.error('Failed to seed admin:', err);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
 
