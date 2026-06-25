import { Request, Response } from 'express';
import User from '../models/User';
import Exam from '../models/Exam';
import Submission from '../models/Submission';

export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const institutions = await User.countDocuments({ role: 'teacher' });
    const students = await User.countDocuments({ role: 'student' });
    const exams = await Exam.countDocuments();
    const submissions = await Submission.countDocuments();
    
    // Send 100% real numbers, with a fallback to 0 if the DB is empty
    res.json({
      institutions: institutions || 0,
      students: students || 0,
      exams: exams || 0,
      submissions: submissions || 0
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};
