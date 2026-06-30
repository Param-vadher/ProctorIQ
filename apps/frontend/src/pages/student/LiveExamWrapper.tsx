import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Clock, XCircle, Flag, Award, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const LiveExamWrapper = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [session, setSession] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Tracking
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [warnings, setWarnings] = useState(0);

  // Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Autosave interval ref
  const syncInterval = useRef<any>(null);
  
  // AI Proctoring refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const proctorIntervalRef = useRef<any>(null);

  useEffect(() => {
    fetchExamData();
    // Initialize Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => console.log('Fullscreen failed:', err));
    }
    
    // Start Webcam
    startWebcam();
    
    return () => {
      stopWebcam();
    };
  }, [examId]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Webcam error:', err);
      toast.error('Webcam is required for the exam.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const fetchExamData = async () => {
    try {
      const identityPhoto = location.state?.identityPhoto;
      const { data } = await api.post(`/student/exam/${examId}/start`, { identityPhoto });
      setExam(data.exam);
      setQuestions(data.questions);
      setSession(data.session);
      
      // Load session data
      const ansMap: Record<string, number> = {};
      data.session.answers.forEach((a: any) => { ansMap[a.questionId] = a.selectedOptionIndex; });
      setAnswers(ansMap);
      
      setVisited(new Set(data.session.visitedQuestions));
      setFlagged(new Set(data.session.flaggedQuestions));
      setWarnings(data.session.warnings || 0);

      // Calculate time left
      const elapsed = Math.floor((Date.now() - new Date(data.session.startTime).getTime()) / 1000);
      const remaining = Math.max((data.exam.duration * 60) - elapsed, 0);
      setTimeLeft(remaining);
      setLoading(false);
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to start exam. It might be inactive or missing questions.');
      navigate('/student/exams');
    }
  };

  // ----------------------------------------------------
  // Anti-Cheat Engine (Module C)
  // ----------------------------------------------------
  const handleViolation = useCallback(() => {
    if (isSubmitting || result) return;
    setWarnings(prev => {
      const newWarnings = prev + 1;
      
      // Auto submit on 3rd warning
      if (newWarnings >= 3) {
        toast.error('Maximum warnings reached. Your exam is being automatically submitted.', { duration: 5000 });
        forceSubmitExam(newWarnings);
      } else {
        toast.error(`WARNING ${newWarnings}/3: Tab switching or exiting fullscreen is prohibited.`, { duration: 5000 });
        // Sync warning to backend immediately
        triggerSync(newWarnings);
      }
      return newWarnings;
    });
  }, [isSubmitting, result]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && session && session.status === 'in-progress') {
        handleViolation();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && session && session.status === 'in-progress') {
        handleViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleViolation, session]);

  // AI Proctor Frame Analysis
  const captureAndAnalyzeFrame = async () => {
    if (!session || session.status !== 'in-progress' || isSubmitting || result) return;
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Only capture if video is playing
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.5); // compress slightly

        try {
          const { data } = await api.post(`/student/exam/session/${session._id}/proctor`, { image: imageBase64 });
          if (data.violationDetected) {
             toast.error(`AI Detected: ${data.reason}`, { duration: 4000 });
             handleViolation();
          }
        } catch (err) {
          console.error('Proctoring API error', err);
        }
      }
    }
  };

  useEffect(() => {
    if (!session || result || isSubmitting) {
       if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
       return;
    }

    proctorIntervalRef.current = setInterval(() => {
      captureAndAnalyzeFrame();
    }, 15000); // Check every 15 seconds

    return () => clearInterval(proctorIntervalRef.current);
  }, [session, result, isSubmitting, handleViolation]);

  // ----------------------------------------------------
  // Persistent Live Autosave Sync (Module B)
  // ----------------------------------------------------
  const triggerSync = async (currentWarnings = warnings) => {
    if (!session || session.status !== 'in-progress') return;
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex
      }));

      await api.post(`/student/exam/session/${session._id}/sync`, {
        answers: formattedAnswers,
        visitedQuestions: Array.from(visited),
        flaggedQuestions: Array.from(flagged),
        warnings: currentWarnings
      });
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  };

  // Setup 30s autosave interval
  useEffect(() => {
    if (!session || result || isSubmitting) return;

    syncInterval.current = setInterval(() => {
      triggerSync();
    }, 30000);

    return () => clearInterval(syncInterval.current);
  }, [session, answers, visited, flagged, warnings, result, isSubmitting]);

  // ----------------------------------------------------
  // Timer & Submission logic
  // ----------------------------------------------------
  useEffect(() => {
    if (timeLeft === null || isSubmitting || result) return;
    if (timeLeft <= 0) {
      forceSubmitExam(warnings);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, result, warnings]);

  const forceSubmitExam = async (finalWarnings: number) => {
    if (isSubmitting || !session) return;
    setIsSubmitting(true);
    
    // Final sync before submit
    await triggerSync(finalWarnings);

    try {
      const { data } = await api.post(`/student/exam/session/${session._id}/submit`);
      setResult(data);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    setShowSubmitModal(false);
    forceSubmitExam(warnings);
  };

  // ----------------------------------------------------
  // UI Interaction Handlers
  // ----------------------------------------------------
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  const selectOption = (qId: string, optIndex: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Mark visited when changing question
  useEffect(() => {
    if (questions.length > 0) {
      const qId = questions[currentQIndex]._id;
      setVisited(prev => {
        const next = new Set(prev);
        next.add(qId);
        return next;
      });
    }
  }, [currentQIndex, questions]);


  // ----------------------------------------------------
  // Renders
  // ----------------------------------------------------
  if (result) {
    const percentage = Math.round((result.score / result.totalMarks) * 100);
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100 bg-light" style={{ userSelect: 'none' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="premium-card p-0 text-center overflow-hidden shadow-lg border-0" 
          style={{ maxWidth: '550px', width: '100%', borderRadius: '24px' }}
        >
          {/* Header Banner */}
          <div className={`p-5 text-white position-relative ${result.isPassed ? 'bg-success' : 'bg-danger'}`} style={{ background: result.isPassed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
              className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow" 
              style={{ width: '100px', height: '100px' }}
            >
              {result.isPassed ? <Award size={50} className="text-success" /> : <XCircle size={50} className="text-danger" />}
            </motion.div>
            <h2 className="mt-4 mb-0 fw-bold">{result.isPassed ? 'Congratulations!' : 'Exam Failed'}</h2>
            <p className="opacity-75 mt-1 mb-0">{result.isPassed ? 'You successfully passed the examination.' : 'Unfortunately, you did not meet the passing criteria.'}</p>
          </div>

          <div className="p-5" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}>
            <h4 className="fw-bold mb-4" style={{ color: 'var(--primary-deep-slate)' }}>Evaluation Results</h4>
            
            <div className="row g-4 mb-4">
              <div className="col-6">
                <div className="p-4 rounded-4 bg-light border">
                  <div className="text-muted small fw-bold mb-1">SCORE</div>
                  <div className={`fs-2 fw-bold ${result.isPassed ? 'text-success' : 'text-danger'}`}>{result.score} <span className="fs-5 text-muted">/ {result.totalMarks}</span></div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-4 rounded-4 bg-light border">
                  <div className="text-muted small fw-bold mb-1">PERCENTAGE</div>
                  <div className="fs-2 fw-bold" style={{ color: 'var(--text-primary)' }}>{percentage}%</div>
                </div>
              </div>
            </div>

            {warnings > 0 && (
              <div className="alert alert-warning border-warning d-flex align-items-center text-start p-3 rounded-4 mb-4">
                <AlertTriangle size={24} className="text-warning me-3 flex-shrink-0" />
                <div>
                  <strong className="d-block" style={{ color: 'var(--text-primary)' }}>Proctoring Flag</strong>
                  <span className="small text-muted">You triggered {warnings} automated warning(s) during this session. Your instructor will review the logs.</span>
                </div>
              </div>
            )}

            <button className="btn btn-primary-custom w-100 py-3 fw-bold rounded-pill shadow-sm" onClick={() => navigate('/student/dashboard')}>
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div className="premium-card p-5 text-center fade-in" style={{ maxWidth: '500px', width: '100%' }}>
          <h3 className="text-danger mb-3">No Questions Found</h3>
          <p className="text-muted mb-4">This exam does not have any questions assigned to it. Please contact your instructor.</p>
          <button className="btn btn-primary-custom" onClick={() => navigate('/student/exams')}>
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const isUnder5Mins = timeLeft !== null && timeLeft < 300;

  return (
    <div className="bg-light min-vh-100 d-flex flex-column" style={{ userSelect: 'none' }}>
      {/* Sticky Header Control Bar */}
      <div className="bg-white border-bottom py-3 shadow-sm px-4 d-flex justify-content-between align-items-center sticky-top">
        <h5 className="mb-0 text-truncate" style={{ maxWidth: '40%' }}>{exam.title}</h5>
        
        <div className="d-flex align-items-center gap-4">
          <div className={`d-flex align-items-center fw-bold fs-4 ${isUnder5Mins ? 'timer-warning' : 'text-primary'}`}>
            <Clock size={24} className="me-2" />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
      </div>

      <div className="container-fluid flex-grow-1 d-flex p-0">
        {/* Main Question Panel */}
        <div className="col-md-9 p-4 overflow-auto" style={{ height: 'calc(100vh - 70px)' }}>
          <div className="premium-card p-5 mb-4 position-relative">
            <div className="d-flex justify-content-between mb-4">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 fs-6">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted fw-bold">{currentQ.marks} Marks</span>
                <button 
                  className={`btn btn-sm ${flagged.has(currentQ._id) ? 'btn-warning text-white' : 'btn-outline-warning'}`}
                  onClick={() => toggleFlag(currentQ._id)}
                >
                  <Flag size={16} className="me-1" /> {flagged.has(currentQ._id) ? 'Flagged' : 'Flag'}
                </button>
              </div>
            </div>
            
            <h4 className="mb-4 lh-base">{currentQ.questionText}</h4>
            
            <div className="list-group">
              {currentQ.options.map((opt: string, index: number) => {
                const isSelected = answers[currentQ._id] === index;
                return (
                  <button
                    key={index}
                    className={`list-group-item list-group-item-action py-3 px-4 mb-3 border rounded transition-all ${isSelected ? 'active border-primary bg-primary bg-opacity-10 text-primary fw-bold' : ''}`}
                    onClick={() => selectOption(currentQ._id, index)}
                    style={{ transition: 'all 0.2s' }}
                  >
                    <div className="d-flex align-items-center">
                      <div className={`rounded-circle border d-flex align-items-center justify-content-center me-3 ${isSelected ? 'border-primary bg-primary text-white' : 'border-secondary'}`} style={{ width: '28px', height: '28px', fontSize: '14px' }}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="fs-6">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="d-flex justify-content-between mt-5 pt-3 border-top">
              <button 
                className="btn btn-outline-secondary px-4 py-2" 
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
              >
                Previous
              </button>
              <button 
                className="btn btn-primary-custom px-5 py-2" 
                disabled={currentQIndex === questions.length - 1}
                onClick={() => setCurrentQIndex(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Grid */}
        <div className="col-md-3 exam-sidebar p-4">
          <h6 className="mb-3 text-uppercase text-muted fw-bold">Question Navigator</h6>
          
          <div className="d-flex flex-wrap gap-2 mb-4">
            {questions.map((q, i) => {
              const qId = q._id;
              const isAnswered = answers[qId] !== undefined;
              const isFlagged = flagged.has(qId);
              const isVisited = visited.has(qId);
              
              let btnClass = 'question-grid-btn';
              if (isFlagged) btnClass += ' flagged';
              else if (isAnswered) btnClass += ' answered';
              else if (isVisited) btnClass += ' visited';

              if (i === currentQIndex) btnClass += ' border-primary border-2 shadow-sm';

              return (
                <button
                  key={qId}
                  className={btnClass}
                  onClick={() => setCurrentQIndex(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="d-flex flex-column gap-2 small text-muted mb-5 bg-light p-3 rounded border">
            <div className="d-flex align-items-center"><div className="rounded me-2" style={{ width: '16px', height: '16px', backgroundColor: 'var(--accent-primary)' }}></div> Answered</div>
            <div className="d-flex align-items-center"><div className="rounded me-2" style={{ width: '16px', height: '16px', backgroundColor: '#f97316' }}></div> Flagged</div>
            <div className="d-flex align-items-center"><div className="rounded me-2" style={{ width: '16px', height: '16px', backgroundColor: 'var(--primary-deep-slate)' }}></div> Visited (Unanswered)</div>
            <div className="d-flex align-items-center"><div className="border border-secondary rounded me-2 bg-white" style={{ width: '16px', height: '16px' }}></div> Unvisited</div>
          </div>
          
          <button 
            className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
            onClick={handleManualSubmit}
          >
            Submit Exam
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showSubmitModal}
        title="Submit Exam"
        message="Are you sure you want to submit your exam? You cannot undo this action."
        confirmText="Submit"
        cancelText="Cancel"
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
        variant="primary"
      />
      
      {/* Hidden elements for AI Proctoring */}
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default LiveExamWrapper;
