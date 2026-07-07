import { Router } from 'express';
import { 
  getDashboardStats, 
  createSubject, getSubjects, 
  createExam, getExams, 
  createQuestion, getQuestions, updateQuestion, deleteQuestion, bulkImportQuestions,
  getLiveMonitorSessions, overrideLiveSession,
  getSubmissions, getSubmissionReport,
  getUsers, createUser, updateUser, deleteUser
} from '../controllers/adminController';
import { validateData } from '../middleware/validateData';
import { 
  createSubjectSchema, createQuestionSchema, updateQuestionSchema,
  createExamSchema, createUserSchema, updateUserSchema
} from '../validations/admin.validation';

const router = Router();

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Subjects
router.post('/subjects', validateData(createSubjectSchema), createSubject);
router.get('/subjects', getSubjects);

// Questions
router.post('/questions', validateData(createQuestionSchema), createQuestion);
router.get('/questions', getQuestions);
router.put('/questions/:id', validateData(updateQuestionSchema), updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.post('/questions/bulk', bulkImportQuestions);

// Exams
router.post('/exams', validateData(createExamSchema), createExam);
router.get('/exams', getExams);

// Live Proctoring
router.get('/live-monitor', getLiveMonitorSessions);
router.post('/live-monitor/override/:sessionId', overrideLiveSession);

// Submissions
router.get('/submissions', getSubmissions);
router.get('/submissions/:id/report', getSubmissionReport);

// Users (Admin Only)
router.get('/users', getUsers);
router.post('/users', validateData(createUserSchema), createUser);
router.put('/users/:id', validateData(updateUserSchema), updateUser);
router.delete('/users/:id', deleteUser);

export default router;
