import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Mail, CheckCircle, Clock, Reply } from 'lucide-react';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await api.get('/admin/inquiries');
      setInquiries(res.data);
    } catch (error) {
      console.error('Failed to fetch inquiries', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
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
    return <div className="p-4 text-muted">Loading inquiries...</div>;
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-primary-deep"><Mail className="me-2 text-primary" size={28} /> Inquiries & Support</h2>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="premium-card h-100 p-0 overflow-hidden">
            <div className="p-3 border-bottom bg-light">
              <h5 className="mb-0 fw-bold">Inbox</h5>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {inquiries.length === 0 ? (
                <div className="p-4 text-center text-muted">No inquiries found.</div>
              ) : (
                inquiries.map((inq) => (
                  <button 
                    key={inq._id}
                    className={`list-group-item list-group-item-action p-3 ${selectedInquiry?._id === inq._id ? 'active-item' : ''}`}
                    onClick={() => { setSelectedInquiry(inq); setReplyText(''); }}
                    style={{ backgroundColor: selectedInquiry?._id === inq._id ? 'var(--bg-porcelain)' : 'transparent' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 fw-bold">{inq.name}</h6>
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

        <div className="col-lg-7">
          {selectedInquiry ? (
            <div className="premium-card h-100 p-4 d-flex flex-column">
              <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">{selectedInquiry.name}</h4>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-decoration-none">{selectedInquiry.email}</a>
                </div>
                <div className="text-end">
                  <span className="text-muted small">Received on {new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 rounded glass-panel mb-4">
                <p className="mb-0 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              {selectedInquiry.status === 'replied' ? (
                <div className="mt-auto">
                  <h6 className="fw-bold text-success mb-3"><CheckCircle size={18} className="me-2"/> Admin Reply (Sent on {new Date(selectedInquiry.repliedAt).toLocaleDateString()})</h6>
                  <div className="p-3 bg-light rounded border border-success border-opacity-25">
                    <p className="mb-0 whitespace-pre-wrap">{selectedInquiry.adminReply}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-auto border-top pt-4">
                  <h6 className="fw-bold mb-3"><Reply size={18} className="me-2"/> Send Reply</h6>
                  <form onSubmit={handleReply}>
                    <textarea 
                      className="form-control form-control-custom mb-3" 
                      rows={5} 
                      placeholder="Type your reply here. This will be sent directly to their email..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                    <div className="text-end">
                      <button type="submit" className="btn btn-primary-custom px-4" disabled={sending}>
                        {sending ? 'Sending Email...' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="premium-card h-100 d-flex flex-column align-items-center justify-content-center text-muted">
              <Mail size={48} className="mb-3 opacity-50" />
              <h5>Select an inquiry to view details</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInquiries;
