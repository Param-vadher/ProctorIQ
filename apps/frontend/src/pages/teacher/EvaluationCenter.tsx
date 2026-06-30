import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, XCircle, Search, AlertTriangle } from 'lucide-react';


const EvaluationCenter = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/teacher/submissions');
        setSubmissions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(sub => 
    sub.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.examId?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-deep-slate)' }}>Evaluation Center</h2>
          <p className="text-muted">Review student exam submissions and proctoring logs.</p>
        </div>
        <div className="position-relative" style={{ width: '300px' }}>
          <Search size={18} className="position-absolute text-muted" style={{ top: '12px', left: '15px' }} />
          <input 
            type="text" 
            className="form-control form-control-custom ps-5" 
            placeholder="Search by student or exam..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="premium-card p-0 overflow-hidden shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="table-responsive minimal-scrollbar">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th className="py-3 px-4 small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>STUDENT</th>
                <th className="py-3 px-3 small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>EXAM</th>
                <th className="py-3 px-3 small fw-bold text-uppercase text-center" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>SCORE</th>
                <th className="py-3 px-3 small fw-bold text-uppercase text-center" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>STATUS</th>
                <th className="py-3 px-3 small fw-bold text-uppercase text-center" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>WARNINGS</th>
                <th className="py-3 px-3 small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>DATE</th>
                <th className="py-3 px-4 small fw-bold text-uppercase text-end" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>Loading submissions...</td></tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>No submissions found.</td></tr>
              ) : (
                filteredSubmissions.map((sub, idx) => (
                  <tr 
                    key={sub._id}
                    style={{ borderBottom: '1px solid var(--border-color)', animation: `fadeInUp 0.4s ease both`, animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-4 py-3 fw-bold" style={{ color: 'var(--text-primary)' }}>{sub.studentId?.name || 'Unknown User'}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{sub.examId?.title || 'Unknown Exam'}</td>
                    <td className="py-3 px-3 text-center fw-bold fs-5" style={{ color: sub.isPassed ? 'var(--accent-primary)' : '#ef4444' }}>
                      {sub.score}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`badge rounded-pill px-3 py-2 ${sub.isPassed ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        {sub.isPassed ? <><CheckCircle size={14} className="me-1"/> Passed</> : <><XCircle size={14} className="me-1"/> Failed</>}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {sub.warnings > 0 ? (
                        <span className="badge bg-warning text-dark px-2 py-1 rounded">
                          <AlertTriangle size={12} className="me-1" /> {sub.warnings}
                        </span>
                      ) : (
                        <span className="small" style={{ color: 'var(--text-secondary)' }}>Clean</span>
                      )}
                    </td>
                    <td className="py-3 px-3 small" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button 
                        onClick={() => navigate(`/teacher/evaluation/${sub._id}`)}
                        className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationCenter;
