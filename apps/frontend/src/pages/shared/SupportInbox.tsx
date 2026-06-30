import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, Clock, Send, MessageCircle, User, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SupportInbox = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [receivedInquiries, setReceivedInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [newMessage, setNewMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState(() => {
    if (searchParams.get('studentId')) return 'student';
    if (searchParams.get('teacherId')) return 'teacher';
    // Determine role from token to set a sensible default
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'student') return 'teacher';  // student → only teachers
        if (payload.role === 'admin')   return 'student';  // admin → default student
        if (payload.role === 'teacher') return 'student';  // teacher → default student
      } catch { /* ignore */ }
    }
    return 'teacher';
  });
  const [recipientId, setRecipientId] = useState(
    searchParams.get('studentId') || searchParams.get('teacherId') || ''
  );
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [replyText, setReplyText] = useState('');
  
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Decode role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
        if (payload.role === 'teacher') {
          api.get('/teacher/students').then(res => setStudents(res.data)).catch(console.error);
        }
        if (payload.role === 'student') {
          api.get('/student/teachers').then(res => setTeachers(res.data)).catch(console.error);
        }
        if (payload.role === 'admin') {
          // Admin fetches all students and teachers to message any of them
          api.get('/admin/users').then(res => {
            const allUsers: any[] = res.data;
            setStudents(allUsers.filter((u: any) => u.role === 'student'));
            setTeachers(allUsers.filter((u: any) => u.role === 'teacher'));
          }).catch(console.error);
        }
      } catch {
        console.error("Invalid token");
      }
    }
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await api.get('/inquiries/me');
      setInquiries(res.data);
      
      // If user is teacher, student, or admin, fetch received inquiries
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'teacher' || payload.role === 'student' || payload.role === 'admin') {
          const recvRes = await api.get('/inquiries/received');
          setReceivedInquiries(recvRes.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post('/inquiries/me', { message: newMessage, recipientRole, recipientId });
      setNewMessage('');
      fetchInquiries();
    } catch (error) {
      console.error('Failed to send message', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReplyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;
    setSending(true);
    try {
      await api.post(`/inquiries/${selectedInquiry._id}/reply`, { replyMessage: replyText });
      setReplyText('');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (error) {
      console.error('Failed to send reply', error);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-muted">Loading messages...</div>;
  }

  const displayedList = activeTab === 'sent' ? inquiries : receivedInquiries;

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
        <h2 className="mb-0 text-primary-deep"><MessageCircle className="me-2 text-primary" size={28} /> Support Inbox</h2>
      </div>

      <div className="row g-4">
        {/* Inbox List */}
        <div className="col-lg-5">
          <div className="premium-card h-100 p-0 overflow-hidden">
            <div className="d-flex border-bottom bg-light">
              <button 
                className={`flex-fill border-0 py-3 fw-bold ${activeTab === 'sent' ? 'bg-white text-primary border-bottom border-primary border-3' : 'bg-light text-muted'}`}
                onClick={() => { setActiveTab('sent'); setSelectedInquiry(null); }}
              >
                Sent Messages
              </button>
              {(userRole === 'teacher' || userRole === 'student' || userRole === 'admin') && (
                <button 
                  className={`flex-fill border-0 py-3 fw-bold ${activeTab === 'received' ? 'bg-white text-primary border-bottom border-primary border-3' : 'bg-light text-muted'}`}
                  onClick={() => { setActiveTab('received'); setSelectedInquiry(null); }}
                >
                  Received Messages
                </button>
              )}
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {displayedList.length === 0 ? (
                <div className="p-4 text-center text-muted">No messages found.</div>
              ) : (
                displayedList.map((inq) => (
                  <button 
                    key={inq._id}
                    className={`list-group-item list-group-item-action p-3 ${selectedInquiry?._id === inq._id ? 'active-item' : ''}`}
                    onClick={() => setSelectedInquiry(inq)}
                    style={{ backgroundColor: selectedInquiry?._id === inq._id ? 'var(--bg-porcelain)' : 'transparent' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 fw-bold text-truncate">
                        {activeTab === 'sent' ? `To: ${inq.recipientRole === 'teacher' ? 'Teacher' : inq.recipientRole === 'student' ? 'Student' : 'Admin'}` : `From: ${inq.name}`}
                      </h6>
                      <small className="text-muted">{new Date(inq.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-2 small text-muted text-truncate">{inq.message}</p>
                    <div>
                      {inq.status === 'pending' ? (
                        <span className="badge bg-warning text-dark"><Clock size={12} className="me-1"/> Pending</span>
                      ) : (
                        <span className="badge bg-success"><CheckCircle size={12} className="me-1"/> Replied</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message View / New Message */}
        <div className="col-lg-7">
          {selectedInquiry ? (
            <div className="premium-card h-100 p-4 d-flex flex-column">
              <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                <h4 className="fw-bold mb-0">Conversation Thread</h4>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedInquiry(null)}>
                  Close
                </button>
              </div>

              {/* Original Message */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2" style={{ width: 30, height: 30 }}>
                    <User size={16} />
                  </div>
                  <small className="fw-bold me-2">{activeTab === 'sent' ? 'Me' : selectedInquiry.name}</small>
                  <small className="text-muted">{new Date(selectedInquiry.createdAt).toLocaleString()}</small>
                </div>
                <div className="p-3 bg-light rounded whitespace-pre-wrap border">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Reply Section */}
              {selectedInquiry.status === 'replied' ? (
                <div className="mt-2 ms-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center me-2" style={{ width: 30, height: 30 }}><CheckCircle size={16}/></div>
                    <small className="text-success fw-bold me-2">{activeTab === 'sent' ? (selectedInquiry.recipientRole === 'teacher' ? 'Teacher' : selectedInquiry.recipientRole === 'student' ? 'Student' : 'Admin Support') : 'Me (Replied)'}</small>
                    <small className="text-muted">{new Date(selectedInquiry.repliedAt).toLocaleString()}</small>
                  </div>
                  <div className="p-3 bg-success bg-opacity-10 rounded whitespace-pre-wrap border border-success border-opacity-25">
                    {selectedInquiry.adminReply}
                  </div>
                </div>
              ) : (
                activeTab === 'received' && (
                  <div className="mt-auto border-top pt-4">
                    <h6 className="fw-bold mb-3">Send Reply</h6>
                    <form onSubmit={handleReplyMessage}>
                      <textarea 
                        className="form-control form-control-custom mb-3" 
                        rows={4} 
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                      ></textarea>
                      <div className="text-end">
                        <button type="submit" className="btn btn-primary-custom px-4" disabled={sending}>
                          {sending ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </form>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="premium-card h-100 p-4 d-flex flex-column">
              <h4 className="fw-bold border-bottom pb-3 mb-4"><Send className="me-2 text-primary" size={24}/> Send a New Message</h4>
              <p className="text-muted mb-4">
                {userRole === 'student'
                  ? 'Send a message to one of your teachers.'
                  : userRole === 'admin'
                  ? 'Send a message to any student or teacher.'
                  : 'Send a message to a student.'}
              </p>
              
              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Recipient</label>
                  <select 
                    className="form-select form-select-custom" 
                    value={recipientRole}
                    onChange={(e) => {
                      setRecipientRole(e.target.value);
                      if (e.target.value !== 'student' && e.target.value !== 'teacher') setRecipientId('');
                    }}
                  >
                    {/* Students can ONLY message teachers */}
                    {userRole === 'student' && <option value="teacher">Teacher</option>}
                    {/* Teachers can message students */}
                    {userRole === 'teacher' && <option value="student">Student</option>}
                    {/* Admin can message both students and teachers */}
                    {userRole === 'admin' && <option value="student">Student</option>}
                    {userRole === 'admin' && <option value="teacher">Teacher</option>}
                  </select>
                </div>
                
                {recipientRole === 'student' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Student</label>
                    <select
                      className="form-select form-select-custom"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a student --</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientRole === 'teacher' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Teacher</label>
                    <select
                      className="form-select form-select-custom"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a teacher --</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Your Message</label>
                  <textarea 
                    className="form-control form-control-custom" 
                    rows={5} 
                    placeholder="Describe your issue or question here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-primary-custom px-4" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportInbox;
