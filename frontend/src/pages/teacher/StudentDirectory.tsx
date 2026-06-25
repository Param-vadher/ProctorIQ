import { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StudentDirectory = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/teacher/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-4 text-center text-muted">Loading students...</div>;
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-primary-deep"><Users className="me-2 text-primary" size={28} /> Student Manager</h2>
      </div>

      <div className="premium-card p-4">
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle custom-table">
            <thead className="table-light">
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle me-3 border bg-light d-flex justify-content-center align-items-center"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundImage: student.profilePicture ? `url(${student.profilePicture})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {!student.profilePicture && <Users size={20} className="text-muted" />}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{student.name}</h6>
                          <small className="text-muted">Registered Student</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column text-muted small">
                        <span className="mb-1"><Mail size={14} className="me-1" /> {student.email}</span>
                        {student.phone && <span><Phone size={14} className="me-1" /> {student.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-pill px-3 py-2">
                        Active
                      </span>
                    </td>
                    <td className="text-end">
                      <button 
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        onClick={() => navigate(`/teacher/support?studentId=${student._id}`)}
                      >
                        <MessageSquare size={14} className="me-1" /> Message
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDirectory;
