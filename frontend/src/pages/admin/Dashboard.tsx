import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, FileText, CheckCircle, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalExams: 0, activeSessions: 0, totalSubmissions: 0, passRate: 0 });
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard-stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/admin/submissions');
        setSubmissions(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    fetchSubmissions();
  }, []);

  return (
    <div>
      <h2 className="mb-4 fade-in" style={{ color: 'var(--primary-deep-slate)' }}>Dashboard Overview</h2>
      
      <div className="row mb-5 fade-in">
        <div className="col-md-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 bg-primary bg-opacity-10 me-3">
              <Users size={30} className="text-primary" />
            </div>
            <div>
              <h5 className="text-muted mb-0">Total Students</h5>
              <h2 className="mb-0">{stats.totalStudents}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 me-3" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
              <Activity size={30} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h5 className="text-muted mb-0">System Health</h5>
              <h2 className="mb-0 text-success">Online</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 bg-warning bg-opacity-10 me-3">
              <CheckCircle size={30} className="text-warning" />
            </div>
            <div>
              <h5 className="text-muted mb-0">Pending Approvals</h5>
              <h2 className="mb-0">0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 bg-success bg-opacity-10 me-3">
              <FileText size={30} className="text-success" />
            </div>
            <div>
              <h5 className="text-muted mb-0">Submissions</h5>
              <h2 className="mb-0">{stats.totalSubmissions}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card p-4 fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Recent Submissions</h4>
          <span className="text-muted">Global Pass Rate: {stats.passRate.toFixed(1)}%</span>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                {['Student', 'Exam', 'Score', 'Warnings', 'Status', 'Date'].map((h, i) => (
                  <th key={h} className={`py-3 px-3 small fw-bold text-uppercase ${i === 5 ? 'text-end' : ''}`}
                    style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 10).map((sub: any, idx: number) => (
                <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)', animation: `fadeInUp 0.4s ease both`, animationDelay: `${idx * 0.04}s` }}>
                  <td className="py-3 px-3 fw-semibold" style={{ color: 'var(--text-primary)' }}>{sub.studentId?.name || 'Unknown'}</td>
                  <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{sub.examId?.title || 'Unknown'}</td>
                  <td className="py-3 px-3 fw-bold" style={{ color: 'var(--text-primary)' }}>{sub.score}</td>
                  <td className="py-3 px-3">
                    <span className={`badge rounded-pill ${sub.warnings > 0 ? 'bg-danger' : 'bg-secondary'}`}>{sub.warnings || 0}</span>
                  </td>
                  <td className="py-3 px-3">
                    {sub.isPassed
                      ? <span className="badge rounded-pill bg-success">Passed</span>
                      : <span className="badge rounded-pill bg-danger">Failed</span>}
                  </td>
                  <td className="py-3 px-3 text-end" style={{ color: 'var(--text-secondary)' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
