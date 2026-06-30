import { Router } from 'express';
import { 
  getDashboardStats, 
  createSubject, getSubjects, 
  createExam, getExams, 
  createQuestion, getQuestions, updateQuestion, deleteQuestion, bulkImportQuestions,
  getLiveMonitorSessions, overrideLiveSession,
  getSubmissions, getSubmissionReport, getStudents, generateQuestionsAI
} from '../controllers/adminController';

const router = Router();

// Students List for Exam Assignment
router.get('/students', getStudents);

// Dashboard (Shared for now)
router.get('/dashboard-stats', getDashboardStats);

// Subjects
router.post('/subjects', createSubject);
router.get('/subjects', getSubjects);

// Questions
router.post('/questions', createQuestion);
router.post('/questions/generate', generateQuestionsAI);
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

export default router;
