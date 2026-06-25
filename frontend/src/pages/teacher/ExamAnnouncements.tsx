import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Megaphone, Send } from 'lucide-react';

const ExamAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements/mine');
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);
    try {
      await api.post('/announcements', { title, message, type: 'exam' });
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to send announcement', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-fluid fade-in py-4">
      <h2 className="mb-4" style={{ color: 'var(--primary-deep-slate)' }}>Exam Announcements</h2>
      <p className="text-muted mb-5">Send an exam-related announcement to all students.</p>

      <div className="row">
        <div className="col-md-5 mb-4">
          <div className="premium-card p-4">
            <h4 className="fw-bold mb-4 d-flex align-items-center"><Megaphone className="me-2 text-primary" /> New Announcement</h4>
            <form onSubmit={handleSend}>
              <div className="mb-3">
                <label className="form-label fw-bold">Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Midterm Exam Schedule Updated" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">Message</label>
                <textarea 
                  className="form-control" 
                  rows={6} 
                  placeholder="Detailed announcement here..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary-custom w-100 d-flex justify-content-center align-items-center gap-2" disabled={sending}>
                <Send size={18} /> {sending ? 'Sending...' : 'Send to All Students'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-7">
          <div className="premium-card p-4 h-100">
            <h4 className="fw-bold mb-4">My Past Announcements</h4>
            <div className="d-flex flex-column gap-3">
              {announcements.length === 0 ? (
                <div className="text-muted text-center py-5 border rounded bg-light">No announcements sent yet.</div>
              ) : (
                announcements.map((a) => (
                  <div key={a._id} className="p-3 border rounded bg-white shadow-sm hover-scale transition-all">
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold mb-0 text-dark">{a.title}</h6>
                      <small className="text-primary">{new Date(a.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-0 text-muted small">{a.message}</p>
                    <div className="mt-3 text-end">
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1">
                        Seen by: {a.readBy.length} students
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamAnnouncements;
