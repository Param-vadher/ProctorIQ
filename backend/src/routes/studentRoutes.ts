import { Router } from 'express';
import { 
  getDashboard, 
  getExamLobby, 
  startExam, syncSession, submitExam, getTeachersDirectory
} from '../controllers/studentController';

const router = Router();

// Dashboard
router.get('/dashboard', getDashboard);
router.get('/teachers', getTeachersDirectory);

// Exam Lobby
router.get('/exams/lobby', getExamLobby);

// Live Exam Engine
router.post('/exam/:examId/start', startExam);
router.post('/exam/session/:sessionId/sync', syncSession);
router.post('/exam/session/:sessionId/submit', submitExam);

export default router;
