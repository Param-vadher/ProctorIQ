import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Megaphone, Send } from 'lucide-react';

const AnnouncementsManager = () => {
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
      await api.post('/announcements', { title, message, type: 'global' });
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
    <div>
      <h2 className="mb-4 fade-in" style={{ color: 'var(--primary-deep-slate)' }}>Global Announcements</h2>
      <p className="text-muted fade-in">Send a global announcement to all teachers and students. It will automatically pop up when they log in.</p>

      <div className="row mt-4 fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="col-md-5">
          <div className="premium-card p-4">
            <h4 className="fw-bold mb-4 d-flex align-items-center"><Megaphone className="me-2 text-primary" /> Create Announcement</h4>
            <form onSubmit={handleSend}>
              <div className="mb-3">
                <label className="form-label fw-bold">Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. System Maintenance Tomorrow" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">Message</label>
                <textarea 
                  className="form-control" 
                  rows={5} 
                  placeholder="Type your announcement here..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2" disabled={sending}>
                <Send size={18} /> {sending ? 'Sending...' : 'Send Global Announcement'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-7 mt-4 mt-md-0">
          <div className="premium-card p-4 h-100">
            <h4 className="fw-bold mb-4">Past Announcements</h4>
            <div className="d-flex flex-column gap-3">
              {announcements.length === 0 ? (
                <div className="text-muted text-center py-5">No announcements sent yet.</div>
              ) : (
                announcements.map((a) => (
                  <div key={a._id} className="p-3 border rounded">
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold mb-0 text-dark">{a.title}</h6>
                      <small className="text-muted">{new Date(a.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-0 text-muted small">{a.message}</p>
                    <div className="mt-2 text-end">
                      <span className="badge bg-light text-dark border">
                        Seen by: {a.readBy.length} users
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

export default AnnouncementsManager;
