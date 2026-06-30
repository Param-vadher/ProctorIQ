import mongoose from 'mongoose';
import path from 'path';

import { config } from './config';
import app from './app';
import User from './models/User';
import bcrypt from 'bcryptjs';


const PORT = config.port;
const MONGO_URI = config.mongoUri || 'mongodb://localhost:27017/ProctorIQ_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Admin Seeder — credentials come from .env only, never hardcoded
    try {
      const adminEmail = config.admin.email;
      const adminPassword = config.admin.password;

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
 
