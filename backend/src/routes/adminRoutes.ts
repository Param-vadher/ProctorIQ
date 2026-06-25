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

const router = Router();

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Subjects
router.post('/subjects', createSubject);
router.get('/subjects', getSubjects);

// Questions
router.post('/questions', createQuestion);
router.get('/questions', getQuestions);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.post('/questions/bulk', bulkImportQuestions);

// Exams
router.post('/exams', createExam);
router.get('/exams', getExams);

// Live Proctoring
router.get('/live-monitor', getLiveMonitorSessions);
router.post('/live-monitor/override/:sessionId', overrideLiveSession);

// Submissions
router.get('/submissions', getSubmissions);
router.get('/submissions/:id/report', getSubmissionReport);

// Users (Admin Only)
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
