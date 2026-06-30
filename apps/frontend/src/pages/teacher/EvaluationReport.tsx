import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, XCircle, AlertTriangle, FileText, Target, Hash, AlertOctagon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportData {
  submission: any;
  analytics: any;
  questions: any[];
}

const EvaluationReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(`/teacher/submissions/${id}/report`);
        setReport(data);
      } catch (err) {
        console.error(err);
        alert('Failed to load report.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id]);

  if (loading) {
    return <div className="container-fluid py-5 text-center text-muted fade-in">Loading report details...</div>;
  }

  if (!report) {
    return <div className="container-fluid py-5 text-center text-danger fade-in">Failed to load report.</div>;
  }

  return (
    <div className="container-fluid py-4 fade-in">
      {/* Header */}
      <div className="d-flex align-items-start mb-4 justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-start">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center p-2 me-3 rounded-circle shadow-sm"
            style={{ width: '40px', height: '40px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary mb-2 rounded-pill px-3 py-1 fw-semibold">Evaluation Report</span>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-deep-slate)' }}>{report.submission.student.name}</h2>
            <p className="mb-0 fs-5" style={{ color: 'var(--text-secondary)' }}>{report.submission.exam.title}</p>
          </div>
        </div>
        
        {report.submission.identityPhoto && (
          <div className="text-end text-sm-center">
            <div className="small fw-bold text-muted mb-2 tracking-wider">IDENTITY VERIFICATION</div>
            <img 
              src={report.submission.identityPhoto} 
              alt="Student Identity" 
              className="rounded-3 shadow-sm border"
              style={{ width: '120px', height: '90px', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>

      <div className="premium-card p-4 p-md-5 mb-4 shadow-sm" style={{ borderRadius: '16px' }}>
        {/* High Level Stats */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="p-4 rounded-4 text-center h-100 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="text-muted small fw-bold mb-2 tracking-wider">FINAL SCORE</div>
              <div className="display-4 fw-bold" style={{ color: report.submission.isPassed ? 'var(--accent-primary)' : '#ef4444' }}>
                {report.submission.score}
              </div>
              <div className="small mt-2 text-muted fw-medium">Out of {report.submission.exam.totalMarks}</div>
            </div>
          </div>
          <div className="col-md-9">
            <div className="row g-3 h-100">
              <div className="col-6 col-sm-3">
                <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-center shadow-sm hover-lift" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div className="d-flex align-items-center mb-2"><Target size={18} className="text-primary me-2"/><span className="text-muted small fw-bold">ACCURACY</span></div>
                  <div className="fs-2 fw-bold" style={{ color: 'var(--text-primary)' }}>{report.analytics.accuracy}%</div>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-center shadow-sm hover-lift" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div className="d-flex align-items-center mb-2"><CheckCircle size={18} className="text-success me-2"/><span className="text-muted small fw-bold">CORRECT</span></div>
                  <div className="fs-2 fw-bold text-success">{report.analytics.correctCount}</div>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-center shadow-sm hover-lift" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div className="d-flex align-items-center mb-2"><XCircle size={18} className="text-danger me-2"/><span className="text-muted small fw-bold">INCORRECT</span></div>
                  <div className="fs-2 fw-bold text-danger">{report.analytics.incorrectCount}</div>
                </div>
              </div>
              <div className="col-6 col-sm-3">
                <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-center shadow-sm hover-lift" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div className="d-flex align-items-center mb-2"><Hash size={18} className="text-muted me-2"/><span className="text-muted small fw-bold">SKIPPED</span></div>
                  <div className="fs-2 fw-bold" style={{ color: 'var(--text-primary)' }}>{report.analytics.skippedCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proctoring Warning Notice */}
        {report.submission.warnings > 0 && (
          <div className="alert border-warning mb-5 d-flex align-items-center p-4 rounded-4 shadow-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertOctagon size={36} className="text-warning me-4 flex-shrink-0" />
            <div>
              <h5 className="fw-bold text-warning mb-1">Proctoring Intervention Recorded</h5>
              <span className="fs-6" style={{ color: 'var(--text-secondary)' }}>This student triggered <strong>{report.submission.warnings}</strong> automated proctoring warnings during the examination.</span>
            </div>
          </div>
        )}

        <h4 className="fw-bold mb-4 d-flex align-items-center mt-5" style={{ color: 'var(--primary-deep-slate)' }}>
          <FileText className="me-3 text-primary" size={28} /> Detailed Question Breakdown
        </h4>

        <div className="d-flex flex-column gap-4">
          {report.questions.map((q, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={q.questionId} 
              className="p-4 rounded-4 shadow-sm hover-lift" 
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 fs-6">Question {i + 1}</span>
                  <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{q.subject}</span>
                  <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{q.difficulty}</span>
                </div>
                <div className="fw-bold fs-4" style={{ color: q.isCorrect ? 'var(--accent-primary)' : '#ef4444' }}>
                  {q.marksEarned} <span className="fs-6 text-muted fw-normal">/ {q.marks}</span>
                </div>
              </div>

              <h5 className="fw-bold lh-base mb-4 mt-2" style={{ color: 'var(--text-primary)' }}>{q.questionText}</h5>

              <div className="row g-3">
                {q.options.map((opt: string, optIdx: number) => {
                  const isStudentSelection = q.selectedOptionIndex === optIdx;
                  const isCorrectOption = q.correctOptionIndex === optIdx;
                  
                  let style = {
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  };

                  let icon = null;

                  if (isCorrectOption) {
                    style = { backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981' };
                    icon = <CheckCircle size={20} className="text-success ms-auto flex-shrink-0" />;
                  } else if (isStudentSelection && !q.isCorrect) {
                    style = { backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' };
                    icon = <XCircle size={20} className="text-danger ms-auto flex-shrink-0" />;
                  }

                  return (
                    <div className="col-md-6" key={optIdx}>
                      <div className="p-3 rounded-3 d-flex align-items-center shadow-sm h-100" style={{...style, transition: 'all 0.2s ease'}}>
                        <span className="fw-bold me-3 opacity-50 fs-5">{String.fromCharCode(65 + optIdx)}</span>
                        <span className="fs-6">{opt}</span>
                        {icon}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {q.selectedOptionIndex === -1 && (
                <div className="mt-4 text-warning fw-bold d-flex align-items-center bg-warning bg-opacity-10 p-3 rounded-3 border border-warning border-opacity-25">
                  <AlertTriangle size={20} className="me-2 flex-shrink-0" />
                  Student skipped this question
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluationReport;
