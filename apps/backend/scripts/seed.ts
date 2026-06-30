import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../src/models/User';
import Subject from '../src/models/Subject';
import Question from '../src/models/Question';
import Exam from '../src/models/Exam';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ProctorIQ_db';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Question.deleteMany({});
    await Exam.deleteMany({});

    console.log('Seeding Users...');
    const adminPass = await bcrypt.hash('admin123', 10);
    const teacherPass = await bcrypt.hash('teacher123', 10);
    const studentPass = await bcrypt.hash('student123', 10);

    const admin = await User.create({ name: 'Admin User', email: 'admin@proctoriq.com', password: adminPass, role: 'admin' });
    const teacher = await User.create({ name: 'Jane Smith', email: 'teacher@proctoriq.com', password: teacherPass, role: 'teacher' });
    const student = await User.create({ name: 'John Doe', email: 'student@proctoriq.com', password: studentPass, role: 'student' });

    console.log('Seeding Subject...');
    const subject = await Subject.create({
      name: 'Computer Science 101',
      code: 'CS101',
      description: 'Intro to programming'
    });

    console.log('Seeding Questions...');
    const q1 = await Question.create({
      subjectId: subject._id,
      subtopic: 'Basics',
      difficulty: 'Easy',
      questionText: 'What does CPU stand for?',
      options: ['Central Process Unit', 'Computer Personal Unit', 'Central Processing Unit', 'Central Processor Unit'],
      correctOptionIndex: 2,
      marks: 1
    });

    const q2 = await Question.create({
      subjectId: subject._id,
      subtopic: 'Networking',
      difficulty: 'Medium',
      questionText: 'Which protocol is used for secure web traffic?',
      options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
      correctOptionIndex: 2,
      marks: 2
    });

    console.log('Seeding Exam...');
    await Exam.create({
      title: 'Midterm Examination',
      subjectId: subject._id,
      duration: 60,
      totalMarks: 3,
      passingMarks: 1,
      windowStart: new Date(Date.now() - 86400000), // Yesterday
      windowEnd: new Date(Date.now() + 86400000 * 7), // Next week
      isActive: true,
      proctoringEnabled: true,
      manualQuestions: [q1._id, q2._id],
      assignedStudents: [student._id]
    });

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
