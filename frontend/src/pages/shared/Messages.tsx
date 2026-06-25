import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/messages/contacts');
      setContacts(data);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
      const interval = setInterval(() => {
        fetchMessages(selectedContact._id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setSending(true);
    try {
      const { data } = await api.post('/messages/send', {
        receiverId: selectedContact._id,
        content: newMessage,
      });
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  // Identify current user from token
  let currentUserId = '';
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.userId;
    } catch {
      // ignore
    }
  }

  if (loading) return <div className="p-4 text-muted">Loading contacts...</div>;

  return (
    <div className="container-fluid py-4 fade-in h-100 d-flex flex-column" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      <div className="d-flex align-items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary d-flex align-items-center justify-content-center p-2 me-3 rounded-circle shadow-sm"
          style={{ width: '40px', height: '40px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="mb-0 text-primary-deep">
          <MessageCircle className="me-2 text-primary" size={28} /> Messages
        </h2>
      </div>

      <div className="row flex-grow-1 overflow-hidden premium-card m-0" style={{ minHeight: '600px' }}>
        {/* Contacts Sidebar */}
        <div className="col-md-4 col-lg-3 border-end p-0 d-flex flex-column h-100 bg-white">
          <div className="p-3 border-bottom bg-light">
            <h5 className="mb-0 fw-bold text-dark">Conversations</h5>
          </div>
          <div className="list-group list-group-flush overflow-auto flex-grow-1">
            {contacts.length === 0 ? (
              <div className="p-4 text-center text-muted">No contacts available.</div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id}
                  className={`list-group-item list-group-item-action d-flex align-items-center p-3 border-0 border-bottom ${
                    selectedContact?._id === contact._id ? 'bg-primary bg-opacity-10' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                    style={{
                      width: 45,
                      height: 45,
                      backgroundImage: contact.profilePicture ? `url(${contact.profilePicture})` : undefined,
                      backgroundSize: 'cover',
                    }}
                  >
                    {!contact.profilePicture && <User size={20} />}
                  </div>
                  <div className="overflow-hidden">
                    <h6 className="mb-0 fw-bold text-truncate text-dark">{contact.name}</h6>
                    <small className="text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                      {contact.role}
                    </small>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-md-8 col-lg-9 p-0 d-flex flex-column h-100 bg-light position-relative">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-bottom bg-white d-flex align-items-center shadow-sm" style={{ zIndex: 1 }}>
                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundImage: selectedContact.profilePicture ? `url(${selectedContact.profilePicture})` : undefined,
                    backgroundSize: 'cover',
                  }}
                >
                  {!selectedContact.profilePicture && <User size={20} />}
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-dark">{selectedContact.name}</h5>
                  <small className="text-muted text-capitalize">{selectedContact.role}</small>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted m-auto">
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === currentUserId;
                    return (
                      <div
                        key={msg._id}
                        className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div
                          className={`p-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                          style={{
                            maxWidth: '75%',
                            borderRadius: '1rem',
                            borderBottomRightRadius: isMe ? '4px' : '1rem',
                            borderBottomLeftRadius: !isMe ? '4px' : '1rem',
                          }}
                        >
                          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                          <div
                            className={`small mt-1 text-end ${isMe ? 'text-white-50' : 'text-muted'}`}
                            style={{ fontSize: '10px' }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 bg-white border-top">
                <form onSubmit={handleSendMessage} className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control rounded-pill px-4 py-2 bg-light border-0"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                    style={{ width: 45, height: 45, flexShrink: 0 }}
                    disabled={!newMessage.trim() || sending}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
              <MessageCircle size={64} className="mb-3 opacity-25" />
              <h4>Select a conversation</h4>
              <p>Choose a contact from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
