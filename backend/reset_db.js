const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/ProctorIQ_db';

async function resetDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully.');
    await mongoose.disconnect();
    console.log('Disconnected. Done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetDB();
