import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Menu, X, User,
  BookOpen, GraduationCap, HeadphonesIcon
} from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';
import GlobalAnnouncementPopup from '../components/GlobalAnnouncementPopup';
import DarkModeToggle from '../components/DarkModeToggle';
import { useAuthStore } from '../store/authStore';

const StudentLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.profilePicture) setProfilePic(data.profilePicture);
        if (data.name) setStudentName(data.name);
      } catch {
        // ignore
      }
    };
    fetchProfile();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/student/dashboard', name: 'Dashboard',         icon: <LayoutDashboard size={20} className="me-2" /> },
    { path: '/student/exams',     name: 'Exam Lobby',        icon: <GraduationCap   size={20} className="me-2" /> },
    { path: '/student/teachers',  name: 'Teacher Directory', icon: <BookOpen        size={20} className="me-2" /> },
    { path: '/student/support',   name: 'Support Inbox',     icon: <HeadphonesIcon  size={20} className="me-2" /> },
    { path: '/student/profile',   name: 'My Profile',        icon: <User            size={20} className="me-2" /> },
  ];

  return (
    <>
      <GlobalAnnouncementPopup />
      <div className="d-flex flex-column flex-md-row min-vh-100 position-relative">

        {/* Mobile Topbar */}
        <div
          className="d-md-none d-flex justify-content-between align-items-center p-3 text-white shadow-sm"
          style={{ backgroundColor: 'var(--primary-deep-slate)' }}
        >
          <div className="d-flex align-items-center">
            <Logo className="header-logo me-3" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }} />
            <h5 className="mb-0 fw-bold">Student</h5>
          </div>
          <button className="btn btn-sm btn-light" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50 d-md-none"
            style={{ zIndex: 1040 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`admin-sidebar ${sidebarOpen ? 'd-block position-absolute' : 'd-none d-md-block'}`}
          style={{ width: '250px', height: '100%', minHeight: '100vh', zIndex: 1050, top: 0, left: 0 }}
        >
          {/* Logo + Profile */}
          <div className="px-4 mb-4 pt-4">
            <div className="d-flex align-items-center mb-4">
              <Logo className="header-logo me-2" />
            </div>
            <div className="d-flex align-items-center mb-2 px-2">
              <div
                className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center me-3 shadow-sm bg-white"
                style={{
                  width: '40px', height: '40px',
                  border: '2px solid var(--accent-primary)',
                  backgroundImage: profilePic ? `url(${profilePic})` : undefined,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }}
              >
                {!profilePic && <User size={20} className="text-muted" />}
              </div>
              <div>
                <div className="small fw-bold text-truncate" style={{ color: 'var(--text-primary)', maxWidth: '120px' }}>
                  {studentName}
                </div>
                <div className="text-muted" style={{ fontSize: '11px' }}>ProctorIQ Student</div>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <ul className="nav flex-column">
            {navItems.map(item => (
              <li className="nav-item" key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Logout */}
            <li className="nav-item mt-auto p-4">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                <DarkModeToggle />
                <span className="fw-bold" style={{ color: 'var(--text-secondary)' }}>Student Panel</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  padding: '0.6rem',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                }}
              >
                <LogOut size={20} />
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 bg-light overflow-auto p-3 p-md-4" style={{ height: '100vh', overflowX: 'hidden' }}>
          <div className="container-fluid fade-in p-0">
            <Outlet />
          </div>
        </div>

      </div>
    </>
  );
};

export default StudentLayout;
