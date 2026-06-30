import { Request, Response } from 'express';
import Subject from '../models/Subject';
import Exam from '../models/Exam';
import Question from '../models/Question';
import Submission from '../models/Submission';
import User from '../models/User';
import ActiveExamSession from '../models/ActiveExamSession';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { GoogleGenAI } from '@google/genai';
// ========================
// USER MANAGEMENT
// ========================
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email phone profilePicture');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: { _id: newUser._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, status } = req.body;

    // Validate role is one of the allowed values
    const allowedRoles = ['admin', 'teacher', 'student'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role value' });
    }

    // Check email uniqueness if email is being changed
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }

    const updateData: any = { name, email, role };
    if (status) updateData.status = status;

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Look up the user to be deleted first
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin accounts can NEVER be deleted by anyone
    if (targetUser.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be deleted' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// GLOBAL ANALYTICS
// ========================
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalExams = await Exam.countDocuments();
    const activeSessions = await ActiveExamSession.countDocuments({ status: 'in-progress' });
    const totalSubmissions = await Submission.countDocuments();

    // Calculate passing stats
    const passedSubmissions = await Submission.countDocuments({ isPassed: true });
    const passRate = totalSubmissions > 0 ? (passedSubmissions / totalSubmissions) * 100 : 0;

    // Toughest Questions (mock algorithm: aggregate from submissions could be added here later)
    // For now, we will return some basic stats

    res.json({ totalStudents, totalExams, activeSessions, totalSubmissions, passRate });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// SUBJECT MANAGEMENT
// ========================
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name is required' });
    let { code } = req.body;
    if (!code) {
      code = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);
    }
    const newSubject = new Subject({ name, code, description });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// QUESTION BANK MANAGEMENT
// ========================
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { subjectId, subtopic, difficulty, questionText, options, correctOptionIndex, explanation, marks } = req.body;
    const newQuestion = new Question({ subjectId, subtopic, difficulty, questionText, options, correctOptionIndex, explanation, marks });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { subjectId, difficulty } = req.query;
    let filter: any = {};
    if (subjectId) filter.subjectId = subjectId;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter).populate('subjectId', 'name code');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    // Explicit whitelist — never pass req.body directly to prevent mass assignment
    const { subjectId, subtopic, difficulty, questionText, options, correctOptionIndex, explanation, marks } = req.body;
    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { subjectId, subtopic, difficulty, questionText, options, correctOptionIndex, explanation, marks },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkImportQuestions = async (req: Request, res: Response) => {
  try {
    const questions = req.body.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid format: expected a non-empty array of questions' });
    }

    // Validate each question before inserting
    const requiredFields = ['subjectId', 'questionText', 'options', 'correctOptionIndex'];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      for (const field of requiredFields) {
        if (q[field] === undefined || q[field] === null) {
          return res.status(400).json({ message: `Question at index ${i} is missing required field: '${field}'` });
        }
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ message: `Question at index ${i} must have at least 2 options` });
      }
      if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        return res.status(400).json({ message: `Question at index ${i} has an invalid correctOptionIndex` });
      }
    }

    await Question.insertMany(questions);
    res.status(201).json({ message: `Successfully imported ${questions.length} questions.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error during bulk import' });
  }
};

// ========================
// AUTOMATED EXAM GENERATOR
// ========================
export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      title, subjectId, duration, totalMarks, passingMarks,
      windowStart, windowEnd, proctoringEnabled,
      dynamicConfig, manualQuestions, assignedStudents
    } = req.body;

    const newExam = new Exam({
      title, subjectId, duration, totalMarks, passingMarks,
      windowStart, windowEnd, proctoringEnabled,
      dynamicConfig, manualQuestions, assignedStudents
    });

    await newExam.save();
    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find().populate('subjectId');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// LIVE PROCTOR MONITORING HUB
// ========================
export const getLiveMonitorSessions = async (req: Request, res: Response) => {
  try {
    // Fetch active sessions, prioritize those with warnings
    const sessions = await ActiveExamSession.find({ status: 'in-progress' })
      .populate('studentId', 'name email')
      .populate('examId', 'title')
      .sort({ warnings: -1, lastSyncTime: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const overrideLiveSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { action } = req.body; // 'terminate' or 'extend'

    const session = await ActiveExamSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (action === 'terminate') {
      session.status = 'terminated';
      await session.save();
      res.json({ message: 'Session terminated' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// SUBMISSIONS
// ========================
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find()
      .populate('studentId', 'name email')
      .populate('examId', 'title');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ========================
// DETAILED SUBMISSION REPORT
// ========================
export const getSubmissionReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('studentId', 'name email')
      .populate('examId', 'title totalMarks passingMarks duration');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Load all questions for this submission with full detail (including correct answers)
    const questionIds = submission.answers.map((a: any) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .populate('subjectId', 'name');

    const questionMap = new Map(questions.map((q: any) => [q._id.toString(), q]));

    // Build per-question result
    const questionResults = submission.answers.map((answer: any) => {
      const q: any = questionMap.get(answer.questionId.toString());
      if (!q) return null;

      const isCorrect = q.correctOptionIndex === answer.selectedOptionIndex;
      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        marks: q.marks,
        marksEarned: isCorrect ? q.marks : 0,
        difficulty: q.difficulty,
        subtopic: q.subtopic,
        explanation: q.explanation,
        subject: (q.subjectId as any)?.name || 'N/A',
      };
    }).filter(Boolean);

    // Compute analytics
    const correctCount = questionResults.filter((r: any) => r.isCorrect).length;
    const incorrectCount = questionResults.filter((r: any) => !r.isCorrect && r.selectedOptionIndex !== -1).length;
    const skippedCount = submission.answers.filter((a: any) => a.selectedOptionIndex === -1 || a.selectedOptionIndex === undefined).length;
    const accuracy = questionResults.length > 0 ? ((correctCount / questionResults.length) * 100).toFixed(1) : '0';

    const difficultyBreakdown = {
      Easy: { total: 0, correct: 0 },
      Medium: { total: 0, correct: 0 },
      Hard: { total: 0, correct: 0 },
    };
    questionResults.forEach((r: any) => {
      const d = r.difficulty as 'Easy' | 'Medium' | 'Hard';
      if (difficultyBreakdown[d]) {
        difficultyBreakdown[d].total++;
        if (r.isCorrect) difficultyBreakdown[d].correct++;
      }
    });

    res.json({
      submission: {
        _id: submission._id,
        score: submission.score,
        isPassed: submission.isPassed,
        warnings: submission.warnings,
        submittedAt: submission.submittedAt,
        student: submission.studentId,
        exam: submission.examId,
        identityPhoto: submission.identityPhoto,
      },
      analytics: { correctCount, incorrectCount, skippedCount, accuracy, difficultyBreakdown },
      questions: questionResults,
    });
  } catch (error) {
    console.error('Error fetching submission report:', error);
    res.status(500).json({ message: 'Server error fetching submission report' });
  }
};

// ========================
// AI QUESTION GENERATOR
// ========================
export const generateQuestionsAI = async (req: Request, res: Response) => {
  try {
    const { subjectId, subtopic, difficulty, count } = req.body;

    if (!subjectId || !difficulty || !count) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    if (!config.geminiApiKey) {
      return res.status(500).json({ message: 'AI generation is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const prompt = `Generate ${count} multiple choice questions about "${subject.name}"${subtopic ? ` specifically focusing on "${subtopic}"` : ''} at a ${difficulty} difficulty level. 
    Return the response as a raw JSON array of objects. Do not include markdown formatting or the \`\`\`json block wrapper.
    Each object must have exactly these fields:
    - "questionText": string
    - "options": array of exactly 4 strings
    - "correctOptionIndex": integer (0-3)
    - "explanation": string explaining why the answer is correct
    - "marks": integer (typically 1 for Easy, 2 for Medium, 3 for Hard)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text || '[]';
    // Clean up potential markdown if the model ignored instructions
    const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedQuestions = JSON.parse(cleanedText);

    // Map to the format the frontend expects
    const questionsToSave = generatedQuestions.map((q: any) => ({
      ...q,
      subjectId: subject._id,
      difficulty,
      subtopic: subtopic || 'General',
    }));

    const saved = await Question.insertMany(questionsToSave);

    res.json({ message: `Successfully generated and imported ${saved.length} questions`, questions: saved });

  } catch (error) {
    console.error('Error generating questions with AI:', error);
    res.status(500).json({ message: 'Server error generating questions' });
  }
};
