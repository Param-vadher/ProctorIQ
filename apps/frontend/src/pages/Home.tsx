import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ShieldCheck, MonitorPlay, BarChart3, Users, ChevronRight, Home as HomeIcon, Phone, Globe, FileText } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';
import SEO from '../components/SEO';
import DarkModeToggle from '../components/DarkModeToggle';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    institutions: 0,
    students: 0,
    exams: 0,
    submissions: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/public/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'teacher') navigate('/teacher');
        else navigate('/student');
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-porcelain)', overflowX: 'hidden' }}>
      <SEO 
        title="ProctorIQ - Intelligent Online Examination" 
        description="ProctorIQ is an advanced AI-powered online examination platform designed for secure, seamless, and intelligent testing. Maintain academic integrity with advanced AI-driven monitoring." 
      />
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm sticky-top z-3">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <Logo className="header-logo" />
          </Link>
          <div className="d-flex ms-auto gap-3 align-items-center">
            <Link to="/" className="text-decoration-none text-muted fw-semibold d-flex align-items-center gap-1 nav-link-custom">
              <HomeIcon size={18} /> Home
            </Link>
            <Link to="/about" className="text-decoration-none text-muted fw-semibold d-flex align-items-center gap-1 nav-link-custom">
              <Phone size={18} /> Contact
            </Link>
            <DarkModeToggle />
            <Link to="/login" className="btn btn-outline-custom transition-transform hover-scale">Log In</Link>
            <Link to="/register" className="btn btn-primary-custom transition-transform hover-scale shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow-1 d-flex align-items-center py-5 position-relative" style={{ background: 'linear-gradient(135deg, var(--bg-porcelain) 0%, #e2e8f0 100%)', overflow: 'hidden' }}>
        <motion.div 
          className="position-absolute rounded-circle" 
          style={{ width: '600px', height: '600px', background: 'var(--accent-glow)', filter: 'blur(100px)', top: '-100px', right: '-100px', zIndex: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="container position-relative z-1 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto" style={{ maxWidth: '800px' }}>
            <motion.h1 variants={fadeInUp} className="display-3 fw-bolder mb-4" style={{ color: 'var(--primary-deep-slate)', letterSpacing: '-1px' }}>
              Intelligent Remote <br/> <span style={{ color: 'var(--accent-primary)' }}>Proctoring System</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '700px', fontSize: '1.2rem' }}>
              Maintain academic integrity with advanced AI-driven monitoring, secure exam environments, and comprehensive performance analytics for students, teachers, and institutions.
            </motion.p>
            <motion.div variants={fadeInUp} className="d-flex justify-content-center gap-3">
              <Link to="/register" className="btn btn-primary-custom btn-lg d-flex align-items-center gap-2 hover-scale shadow-lg">
                Start Free Trial <ChevronRight size={20} />
              </Link>
              <Link to="/about" className="btn btn-outline-custom btn-lg hover-scale">
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-5 bg-white border-bottom position-relative z-1">
        <div className="container">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="row g-4 text-center"
          >
            {[
              { icon: Globe, num: stats.institutions.toString(), label: "Educators" },
              { icon: Users, num: stats.students.toString(), label: "Students Assessed" },
              { icon: ShieldCheck, num: "99.9%", label: "Exam Security" },
              { icon: FileText, num: stats.submissions.toString(), label: "Total Submissions" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="col-6 col-md-3">
                <motion.div 
                  className="d-flex flex-column align-items-center p-3 rounded"
                  whileHover={{ y: -8, scale: 1.05, backgroundColor: 'var(--bg-porcelain)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <stat.icon size={36} className="mb-3" style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="fw-bolder mb-1" style={{ color: 'var(--primary-deep-slate)' }}>{stat.num}</h3>
                  <p className="text-muted small fw-semibold text-uppercase tracking-wider mb-0">{stat.label}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5" style={{ backgroundColor: 'var(--bg-porcelain)' }}>
        <div className="container py-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="text-center mb-5">
            <h2 className="fw-bold mb-3 display-5">Why Choose ProctorIQ?</h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>Built for modern educational needs with cutting-edge security and a flawless user experience.</p>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="row g-4">
            {[
              { icon: ShieldCheck, title: "Secure Lockdown", desc: "Prevents unauthorized tab switching, copy-pasting, and ensures a secure browser environment." },
              { icon: MonitorPlay, title: "Live Monitoring", desc: "Real-time webcam tracking and identity verification to detect suspicious behavior instantly." },
              { icon: BarChart3, title: "Deep Analytics", desc: "Comprehensive performance reports, heatmaps, and insights to track student progress." },
              { icon: Users, title: "Unified Support", desc: "A streamlined, role-based Support Inbox keeping Students, Teachers, and Admins connected instantly." }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp} className="col-md-3">
                <motion.div whileHover={{ y: -10, boxShadow: 'var(--shadow-xl)' }} className="premium-card p-4 h-100 text-center transition-all bg-white border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                  <div className="mb-3 d-inline-flex p-3 rounded-circle" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <feature.icon size={32} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <h5 className="fw-bold">{feature.title}</h5>
                  <p className="text-muted small">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-5">
            <h2 className="fw-bold mb-3 display-5">How It Works</h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>A seamless exam experience from start to finish.</p>
          </motion.div>

          <div className="row g-4 align-items-center justify-content-center">
            {[
              { step: 1, title: "Create Assessment", desc: "Teachers upload questions and configure security parameters." },
              { step: 2, title: "Identity Verification", desc: "Students verify their identity using a quick webcam scan." },
              { step: 3, title: "Secure Exam", desc: "The secure lockdown browser activates and monitors behavior." },
              { step: 4, title: "Instant Reports", desc: "Teachers receive AI-generated integrity reports immediately." }
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.2 }} className="col-md-6 col-lg-3">
                <motion.div 
                  className="p-4 rounded text-center position-relative h-100 bg-white" 
                  style={{ border: '1px solid var(--border-color)', zIndex: 1 }}
                  whileHover={{ scale: 1.05, y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', borderColor: 'var(--accent-primary)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold mb-3 shadow" 
                    style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-primary)', color: 'white', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' }}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    {item.step}
                  </motion.div>
                  <h5 className="fw-bold mt-4">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-4 text-center border-top bg-white">
        <div className="container">
          <p className="mb-0 text-muted fw-semibold">© {new Date().getFullYear()} ProctorIQ. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .hover-scale {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .hover-scale:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .tracking-wider {
          letter-spacing: 0.05em;
        }
        .nav-link-custom {
          position: relative;
          padding-bottom: 2px;
          transition: color 0.2s ease;
        }
        .nav-link-custom::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--accent-primary);
          transition: width 0.3s ease;
        }
        .nav-link-custom:hover {
          color: var(--primary-deep-slate) !important;
        }
        .nav-link-custom:hover::after {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Home;
