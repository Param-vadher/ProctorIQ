/**
 * One-time script: Updates the admin account password in MongoDB.
 * Run with: node update_admin.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/ProctorIQ_db';
const NEW_EMAIL = 'admin@proctoriq.com';
const NEW_PASSWORD = 'admin@951052';

async function updateAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);

    const result = await usersCollection.updateOne(
      { role: 'admin' },
      { $set: { email: NEW_EMAIL, password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      // No admin exists yet — create one
      await usersCollection.insertOne({
        name: 'System Administrator',
        email: NEW_EMAIL,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      console.log(`Admin account CREATED: ${NEW_EMAIL}`);
    } else {
      console.log(`Admin password UPDATED for: ${NEW_EMAIL}`);
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateAdmin();
