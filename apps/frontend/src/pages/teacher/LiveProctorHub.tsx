import { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertTriangle, Power, Clock, Camera } from 'lucide-react';

const LiveProctorHub = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const fetchLiveSessions = async () => {
    try {
      const { data } = await api.get('/teacher/live-monitor');
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLiveSessions();
    const interval = setInterval(() => {
      fetchLiveSessions();
    }, 10000); // Polling every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleOverride = async (sessionId: string, action: 'terminate' | 'extend') => {
    if (!window.confirm(`Are you sure you want to ${action} this session?`)) return;
    try {
      await api.post(`/teacher/live-monitor/override/${sessionId}`, { action });
      fetchLiveSessions();
    } catch {
      alert(`Failed to ${action} session`);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <h2>Live Proctoring Hub</h2>
        <span className="badge bg-primary fs-6"><Clock size={16} className="me-2 mb-1" /> Live Updates (10s)</span>
      </div>

      <div className="premium-card p-4 fade-in">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Student</th>
                <th>Exam</th>
                <th>Time Started</th>
                <th>Last Sync</th>
                <th>Violations (Warnings)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id} className={session.warnings > 0 ? "table-danger" : ""}>
                  <td className="fw-bold">{session.studentId?.name || 'Unknown'}</td>
                  <td>{session.examId?.title || 'Unknown'}</td>
                  <td>{new Date(session.startTime).toLocaleTimeString()}</td>
                  <td>{new Date(session.lastSyncTime).toLocaleTimeString()}</td>
                  <td>
                    {session.warnings > 0 ? (
                      <span className="badge bg-danger fs-6 heartbeat">
                        <AlertTriangle size={14} className="me-1" /> {session.warnings} Warnings
                      </span>
                    ) : (
                      <span className="badge bg-success">0</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                        onClick={() => setSelectedSessionId(session._id)}
                      >
                        <Camera size={14} className="me-1"/> Live Feed
                      </button>
                      <button 
                        className="btn btn-sm btn-danger d-flex align-items-center"
                        onClick={() => handleOverride(session._id, 'terminate')}
                      >
                        <Power size={14} className="me-1"/> Terminate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    No active exams at the moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSessionId && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content premium-card">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title d-flex align-items-center">
                  <Camera className="text-primary me-2" size={20}/> Live Camera Feed
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedSessionId(null)}></button>
              </div>
              <div className="modal-body text-center p-4">
                {(() => {
                  const s = sessions.find(s => s._id === selectedSessionId);
                  if (s && s.latestFrame) {
                    return (
                      <div className="position-relative d-inline-block border rounded shadow-sm overflow-hidden" style={{ width: '100%', maxWidth: '640px' }}>
                        <img src={s.latestFrame} alt="Live feed" className="img-fluid w-100" />
                        <span className="position-absolute top-0 start-0 m-2 badge bg-danger heartbeat">
                          ● LIVE
                        </span>
                        <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white p-2 text-start">
                          <small>{s.studentId?.name} - Warnings: {s.warnings}</small>
                        </div>
                      </div>
                    );
                  } else {
                    return <p className="text-muted py-5">Waiting for camera feed...</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .heartbeat {
          animation: heartbeat 1s infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default LiveProctorHub;
