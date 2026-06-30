import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const PreExamVerification = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop media tracks function to turn off camera
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);

  const requestCamera = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCameraAccess(true);
    } catch (err: any) {
      console.error("Error accessing media devices.", err);
      setErrorMsg('Camera or Microphone access was denied. Please allow permissions in your browser settings.');
    }
  };

  // Attach stream to video element when step 2 opens
  useEffect(() => {
    if (step === 2 && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageUrl);
        setPhotoTaken(true);
        // We could stop tracks here, but maybe we want to keep it on for the exam. 
        // For now, let's keep it active so the light stays on, simulating live proctoring.
      }
    }
  };

  const handleStartExam = async () => {
    // Optionally stop the tracks here if the exam wrapper requests them anew,
    // or keep them running (though we can't easily pass the stream to the next page, 
    // so it's best to stop it and let LiveExamWrapper request it if needed).
    
    // FULLSCREEN FIX: Request fullscreen directly here on user click
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    }

    stopMediaTracks();
    navigate(`/student/exam/${examId}`, { state: { identityPhoto: capturedImage } });
  };

  const handleCancel = () => {
    stopMediaTracks();
    navigate('/student/exams');
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="premium-card p-5 fade-in" style={{ maxWidth: '700px', width: '100%' }}>
        
        <div className="text-center mb-5">
          <ShieldCheck size={48} className="text-primary mb-3" />
          <h3 className="fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>Identity & Environment Verification</h3>
          <p className="text-muted">ProctorIQ requires verification before granting exam access.</p>
        </div>

        {/* Step 1: Permissions */}
        {step === 1 && (
          <div className="fade-in">
            <h5 className="mb-4">Step 1: System Permissions</h5>
            
            {errorMsg && (
              <div className="alert alert-danger mb-4">
                {errorMsg}
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between p-3 border rounded mb-4 bg-light">
              <div className="d-flex align-items-center">
                <Camera className="text-muted me-3" size={24} />
                <div>
                  <h6 className="mb-0">Webcam & Microphone</h6>
                  <span className="small text-muted">Required for live proctoring.</span>
                </div>
              </div>
              {cameraAccess ? (
                <span className="badge bg-success px-3 py-2"><CheckCircle size={14} className="me-1"/> Granted</span>
              ) : (
                <button className="btn btn-sm btn-outline-primary" onClick={requestCamera}>Request Access</button>
              )}
            </div>
            
            <div className="alert alert-warning d-flex align-items-center small">
              <AlertTriangle size={18} className="me-2 flex-shrink-0" />
              We do not store your video feed. Frames are analyzed in real-time by our AI and immediately discarded unless a violation occurs.
            </div>

            <div className="d-flex justify-content-between mt-5">
              <button className="btn btn-outline-secondary" onClick={handleCancel}>Cancel</button>
              <button 
                className="btn btn-primary-custom" 
                disabled={!cameraAccess}
                onClick={() => setStep(2)}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Face Capture */}
        {step === 2 && (
          <div className="fade-in text-center">
            <h5 className="mb-4">Step 2: Face Recognition Capture</h5>
            <p className="text-muted small mb-4">Please look directly at the camera. Ensure your face is well-lit and clearly visible.</p>
            
            <div 
              className="mx-auto bg-dark position-relative rounded overflow-hidden shadow-sm mb-4 d-flex align-items-center justify-content-center"
              style={{ width: '320px', height: '240px' }}
            >
              {photoTaken && capturedImage ? (
                <>
                  <img src={capturedImage} alt="Captured Identity" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="text-success d-flex flex-column align-items-center fade-in">
                      <CheckCircle size={48} className="mb-2" />
                      <span className="fw-bold text-white">Identity Verified</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                  />
                  {/* Decorative framing overlay */}
                  <div className="position-absolute border border-success opacity-50 pointer-events-none" style={{ width: '180px', height: '200px', borderRadius: '50%', pointerEvents: 'none' }}></div>
                </>
              )}
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!photoTaken ? (
              <button className="btn btn-primary-custom px-4" onClick={takePhoto}>Capture Identity</button>
            ) : (
              <div className="d-flex justify-content-between mt-5">
                <button className="btn btn-outline-secondary" onClick={() => {
                  setPhotoTaken(false);
                  setCapturedImage(null);
                }}>Retake Photo</button>
                <button className="btn btn-success px-4" onClick={handleStartExam}>Begin Examination</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PreExamVerification;
