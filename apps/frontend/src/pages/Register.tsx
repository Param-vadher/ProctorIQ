import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Lock, Mail, Camera, Home as HomeIcon, Phone } from 'lucide-react';
import Logo from '../components/Logo';
import SEO from '../components/SEO';
import DarkModeToggle from '../components/DarkModeToggle';

import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [isAuthenticated, user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validations
    if (!name.trim()) {
      return setError('Name is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, profilePicture });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-porcelain)' }}>
      <SEO title="Register - ProctorIQ" description="Create a new ProctorIQ account." />
      {/* Navbar for going back home */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm mb-auto">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <Logo className="header-logo" />
          </Link>
          <div className="d-flex ms-auto gap-3 align-items-center">
            
            <Link to="/" className="text-decoration-none text-muted fw-semibold d-flex align-items-center gap-1">
              <HomeIcon size={18} /> Home
            </Link>
            <Link to="/about" className="text-decoration-none text-muted fw-semibold d-flex align-items-center gap-1">
              <Phone size={18} /> Contact
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      <div className="d-flex align-items-center justify-content-center flex-grow-1 py-5">
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 className="text-center mb-4">Join ProctorIQ</h2>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="text-center mb-3">
            <label htmlFor="profilePictureInput" style={{ cursor: 'pointer' }}>
              <div 
                className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle overflow-hidden shadow-sm"
                style={{ width: '80px', height: '80px', border: '2px dashed var(--accent-primary)' }}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera style={{ color: 'var(--accent-primary)' }} size={30} />
                )}
              </div>
              <div className="small text-muted mt-1">Upload Photo</div>
            </label>
            <input 
              id="profilePictureInput" 
              type="file" 
              accept="image/*" 
              className="d-none"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setProfilePicture(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="floating-label-group position-relative mb-3">
            <User className="position-absolute text-muted" style={{ left: '10px', top: '12px' }} size={20} />
            <input
              type="text"
              className="form-control form-control-custom ps-5"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="floating-label-group position-relative mb-3">
            <Mail className="position-absolute text-muted" style={{ left: '10px', top: '12px' }} size={20} />
            <input
              type="email"
              className="form-control form-control-custom ps-5"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="floating-label-group position-relative mb-3">
            <Lock className="position-absolute text-muted" style={{ left: '10px', top: '12px' }} size={20} />
            <input
              type="password"
              className="form-control form-control-custom ps-5"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary-custom w-100 mb-3" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="text-center">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-decoration-none" style={{ color: 'var(--accent-primary)' }}>Login</Link>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Register;
