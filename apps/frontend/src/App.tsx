import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register.tsx';
import AdminDashboard from './pages/admin/Dashboard';
import UserAccountsManager from './pages/admin/UserAccountsManager';
import SystemSettings from './pages/admin/SystemSettings';
import GlobalLeaderboard from './pages/admin/GlobalLeaderboard';
import AdminInquiries from './pages/admin/AdminInquiries';
import AnnouncementsManager from './pages/admin/AnnouncementsManager';

import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import QuestionBank from './pages/teacher/QuestionBank';
import BulkQuestionImporter from './pages/teacher/BulkQuestionImporter';
import ExamCreator from './pages/teacher/ExamCreator.tsx';
import StudentDirectory from './pages/teacher/StudentDirectory';
import LiveProctorHub from './pages/teacher/LiveProctorHub';
import EvaluationCenter from './pages/teacher/EvaluationCenter';
import EvaluationReport from './pages/teacher/EvaluationReport';
import ExamAnnouncements from './pages/teacher/ExamAnnouncements';
import Dashboard from './pages/student/Dashboard.tsx';
import ExamLobby from './pages/student/ExamLobby.tsx';
import PreExamVerification from './pages/student/PreExamVerification.tsx';
import LiveExamWrapper from './pages/student/LiveExamWrapper.tsx';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import React from 'react';

import Home from './pages/Home.tsx';
import AboutContact from './pages/AboutContact.tsx';
import TeacherDirectory from './pages/student/TeacherDirectory.tsx';

import MyProfile from './pages/shared/MyProfile.tsx';
import SupportInbox from './pages/shared/SupportInbox.tsx';

// Force IDE watcher to refresh

import { useAuthStore } from './store/authStore';
import { fetchCsrfToken } from './services/api';

const PrivateRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();
  const [init, setInit] = React.useState(false);

  React.useEffect(() => {
    const initApp = async () => {
      await fetchCsrfToken();
      await checkAuth();
      setInit(true);
    };
    initApp();
  }, [checkAuth]);

  if (!init) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutContact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserAccountsManager />} />
            <Route path="leaderboard" element={<GlobalLeaderboard />} />
            <Route path="inquiries"     element={<AdminInquiries />} />
            <Route path="support"       element={<SupportInbox />} />
            <Route path="announcements" element={<AnnouncementsManager />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="profile" element={<MyProfile />} />
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={<PrivateRoute role="teacher"><TeacherLayout /></PrivateRoute>}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="bulk-import" element={<BulkQuestionImporter />} />
            <Route path="create-exam" element={<ExamCreator />} />
            <Route path="live-hub" element={<LiveProctorHub />} />
            <Route path="evaluation" element={<EvaluationCenter />} />
            <Route path="evaluation/:id" element={<EvaluationReport />} />
            <Route path="announcements" element={<ExamAnnouncements />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="support" element={<SupportInbox />} />
            <Route path="students" element={<StudentDirectory />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute role="student"><StudentLayout /></PrivateRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="teachers"  element={<TeacherDirectory />} />
            <Route path="exams"     element={<ExamLobby />} />
            <Route path="profile"   element={<MyProfile />} />
            <Route path="support"   element={<SupportInbox />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>

          {/* Exam flow — no sidebar */}
          <Route path="/student/exam-verify/:examId" element={<PrivateRoute role="student"><PreExamVerification /></PrivateRoute>} />
          <Route path="/student/exam/:examId"         element={<PrivateRoute role="student"><LiveExamWrapper /></PrivateRoute>} />

          {/* Catch-all route to prevent URL glitches (redirect unknown URLs to home) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
