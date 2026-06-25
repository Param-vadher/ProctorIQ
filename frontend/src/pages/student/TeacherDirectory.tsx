import { useEffect, useState } from 'react';
import { Mail, Phone, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TeacherDirectory = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/student/teachers');
      setTeachers(res.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading teachers...</div>;
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex align-items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center p-2 me-3 rounded-circle shadow-sm"
          style={{ width: '40px', height: '40px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="mb-0 text-primary-deep"><Users className="me-2 text-primary" size={28} /> Teacher Directory</h2>
      </div>

      <div className="row g-4">
        {teachers.length === 0 ? (
          <div className="col-12 text-center text-muted p-5 bg-white rounded shadow-sm">
            No teachers found in the directory.
          </div>
        ) : (
          teachers.map(teacher => (
            <div className="col-md-6 col-lg-4" key={teacher._id}>
              <div className="premium-card h-100 p-4 text-center">
                <div 
                  className="rounded-circle mx-auto mb-3 border shadow-sm"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundImage: teacher.profilePicture ? `url(${teacher.profilePicture})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'var(--bg-porcelain)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!teacher.profilePicture && <Users size={32} className="text-muted" />}
                </div>
                <h5 className="fw-bold mb-1 text-primary-deep">{teacher.name}</h5>
                <p className="text-muted small mb-3">Faculty / Instructor</p>
                
                <div className="d-flex flex-column gap-2 text-start bg-light p-3 rounded mb-3">
                  <div className="d-flex align-items-center text-muted small">
                    <Mail size={16} className="me-2 text-primary" />
                    <a href={`mailto:${teacher.email}`} className="text-decoration-none text-muted">{teacher.email}</a>
                  </div>
                  {teacher.phone && (
                    <div className="d-flex align-items-center text-muted small">
                      <Phone size={16} className="me-2 text-primary" />
                      {teacher.phone}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate(`/student/support?teacherId=${teacher._id}`)}
                  className="btn btn-outline-primary w-100 rounded-pill"
                >
                  <MessageSquare size={16} className="me-2" /> Send Message
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDirectory;
