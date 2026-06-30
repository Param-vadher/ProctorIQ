import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { fetchCsrfToken } from '../services/api';
import { Lock, Mail, Home as HomeIcon, Phone } from 'lucide-react';
import Logo from '../components/Logo';
import SEO from '../components/SEO';
import DarkModeToggle from '../components/DarkModeToggle';

import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await fetchCsrfToken();
      login(data.data.user);
      if (data.data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-porcelain)' }}>
      <SEO title="Login - ProctorIQ" description="Sign in to ProctorIQ." />
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
            <Link to="/register" className="btn btn-outline-custom transition-transform hover-scale">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="d-flex align-items-center justify-content-center flex-grow-1">
        <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="text-center mb-2">ProctorIQ Login</h2>
          <p className="text-center text-muted small mb-4">Secure access for Students, Teachers, and Admins</p>
          {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
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
          <div className="floating-label-group position-relative mb-4">
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
          <button type="submit" className="btn btn-primary-custom w-100 mb-3">
            Sign In
          </button>
          <div className="text-center">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="text-decoration-none" style={{ color: 'var(--accent-primary)' }}>Register</Link>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
