import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Logo from '../../components/Logo';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light fade-in py-5">
      <div className="premium-card p-5 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          <Logo className="justify-content-center mb-3" />
          <h3 className="fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>Reset Password</h3>
          <p className="text-muted">
            {step === 1 ? "Enter your email to receive a verification code." : "Enter the OTP sent to your email and a new password."}
          </p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted" /></span>
                <input 
                  type="email" 
                  className="form-control form-control-custom bg-light border-start-0 ps-0" 
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary-custom w-100 d-flex justify-content-center align-items-center" disabled={loading}>
              {loading ? 'Sending...' : <>Send OTP <ArrowRight size={18} className="ms-2" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">One-Time Password (OTP)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><KeyRound size={18} className="text-muted" /></span>
                <input 
                  type="text" 
                  className="form-control form-control-custom bg-light border-start-0 ps-0" 
                  placeholder="Enter 6-digit OTP"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">New Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted" /></span>
                <input 
                  type="password" 
                  className="form-control form-control-custom bg-light border-start-0 ps-0" 
                  placeholder="Create a new password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary-custom w-100 d-flex justify-content-center align-items-center" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <button 
            type="button" 
            className="btn btn-link text-decoration-none text-muted p-0 d-inline-flex align-items-center"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={16} className="me-2" /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
