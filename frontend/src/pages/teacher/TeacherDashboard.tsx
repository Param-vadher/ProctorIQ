import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalExams: 0,
    activeSessions: 0,
    passRate: 0,
    totalSubmissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/teacher/dashboard-stats');
        setStats({
          totalExams: data.totalExams || 0,
          activeSessions: data.activeSessions || 0,
          passRate: data.passRate || 0,
          totalSubmissions: data.totalSubmissions || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="fade-in">
      <h2 className="mb-4 fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>Teacher Dashboard</h2>
      
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted mb-0">Total Created Tests</h6>
              <div className="p-2 rounded bg-light">
                <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
            </div>
            <h3 className="fw-bold mb-0">{loading ? '...' : stats.totalExams}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted mb-0">Active Test-Takers</h6>
              <div className="p-2 rounded bg-light">
                <Users size={20} className="text-primary" />
              </div>
            </div>
            <h3 className="fw-bold mb-0">{loading ? '...' : stats.activeSessions}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted mb-0">Overall Passing Rate</h6>
              <div className="p-2 rounded bg-light">
                <CheckCircle size={20} className="text-success" />
              </div>
            </div>
            <h3 className="fw-bold mb-0">{loading ? '...' : `${stats.passRate.toFixed(1)}%`}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-muted mb-0">Total Submissions</h6>
              <div className="p-2 rounded bg-light">
                <AlertTriangle size={20} className="text-warning" />
              </div>
            </div>
            <h3 className="fw-bold mb-0">{loading ? '...' : stats.totalSubmissions}</h3>
          </div>
        </div>
      </div>

      <div className="premium-card p-4">
        <h5 className="fw-bold mb-4">Hardest Exam Questions Data Insights</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Subject</th>
                <th>Topic</th>
                <th>Question Snippet</th>
                <th>Incorrect Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">No data available.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
