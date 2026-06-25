import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import api from '../../services/api';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const ExamLobby = () => {
  const [activeExams, setActiveExams] = useState<any[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [expiredExams, setExpiredExams] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get('/student/exams/lobby');
        setActiveExams(data.active);
        setUpcomingExams(data.upcoming);
        setExpiredExams(data.expired);
      } catch (err) {
        console.error('Failed to fetch exams', err);
      }
    };
    fetchExams();
  }, []);

  const renderExamCards = (exams: any[], type: 'active' | 'upcoming' | 'expired') => {
    if (exams.length === 0) return <p className="text-muted">No {type} exams.</p>;
    return (
      <div className="row fade-in">
        {exams.map(exam => (
          <div className="col-md-4 mb-4" key={exam._id}>
            <div className="premium-card h-100 p-4 d-flex flex-column">
              <h5 className="mb-1">{exam.title}</h5>
              <p className="text-muted small mb-3">{exam.subjectId?.name}</p>
              
              <div className="d-flex align-items-center mb-2 text-muted small">
                <Calendar size={16} className="me-2" />
                {new Date(exam.windowStart).toLocaleString()} - {new Date(exam.windowEnd).toLocaleString()}
              </div>
              <div className="d-flex align-items-center mb-4 text-muted small">
                <Clock size={16} className="me-2" />
                {exam.duration} Minutes
              </div>
              
              {type === 'active' && (
                <button 
                  className="btn btn-primary-custom w-100 mt-auto"
                  onClick={async () => {
                    if (document.documentElement.requestFullscreen) {
                      try {
                        await document.documentElement.requestFullscreen();
                      } catch (err) {
                        console.error('Fullscreen request failed:', err);
                      }
                    }
                    navigate(`/student/exam-verify/${exam._id}`);
                  }}
                >
                  Enter Verification
                </button>
              )}
              {type === 'upcoming' && (
                <button className="btn btn-secondary w-100 mt-auto" disabled>
                  Starts Later
                </button>
              )}
              {type === 'expired' && (
                <button className="btn btn-outline-secondary w-100 mt-auto" disabled>
                  Expired
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-5">
      <div className="row g-4 fade-in">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <Logo className="header-logo" />
              <div>
                <h2 className="mb-1" style={{ color: 'var(--primary-deep-slate)' }}>Exam Lobby</h2>
                <p className="text-muted mb-0">Select an active exam to begin.</p>
              </div>
            </div>
            <div className="d-flex gap-3 align-items-center">
              
              <button onClick={() => navigate('/student/dashboard')} className="btn btn-outline-custom d-flex align-items-center">
               Back to Dashboard
              </button>
            </div>
          </div>

          <h4 className="mb-3">Active Exams</h4>
          {renderExamCards(activeExams, 'active')}

          <h4 className="mb-3 mt-5">Upcoming Exams</h4>
          {renderExamCards(upcomingExams, 'upcoming')}

          <h4 className="mb-3 mt-5">Expired Exams</h4>
          {renderExamCards(expiredExams, 'expired')}
        </div>

        <div className="col-lg-4">
          <div className="premium-card p-4 sticky-top" style={{ top: '2rem' }}>
            <h5 className="fw-bold mb-4">Pre-Exam Guidelines</h5>
            <div className="d-flex mb-3">
              <div className="text-primary me-3"><ArrowRight size={20} /></div>
              <div>
                <h6 className="mb-1">Stable Internet</h6>
                <p className="small text-muted mb-0">Ensure you have a stable connection. Disconnects may flag your session.</p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <div className="text-primary me-3"><ArrowRight size={20} /></div>
              <div>
                <h6 className="mb-1">Webcam & Mic Required</h6>
                <p className="small text-muted mb-0">You must grant browser permissions before entering the exam.</p>
              </div>
            </div>
            <div className="d-flex mb-3">
              <div className="text-primary me-3"><ArrowRight size={20} /></div>
              <div>
                <h6 className="mb-1">No Tab Switching</h6>
                <p className="small text-muted mb-0">Leaving the exam tab will issue an immediate warning.</p>
              </div>
            </div>
            <div className="d-flex">
              <div className="text-danger me-3"><ArrowRight size={20} /></div>
              <div>
                <h6 className="text-danger mb-1">Warning Limits</h6>
                <p className="small text-muted mb-0">Exceeding 3 warnings automatically terminates and submits your exam.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamLobby;
