import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, MapPin, Phone, Home as HomeIcon } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

const AboutContact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/public/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--bg-porcelain)' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm">
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
            <Link to="/login" className="btn btn-outline-custom">Log In</Link>
          </div>
        </div>
      </nav>

      <div className="container py-5 fade-in">
        <div className="row g-5">
          {/* About Section */}
          <div className="col-lg-6">
            <div className="mb-5">
              <h1 className="fw-bold mb-4" style={{ color: 'var(--primary-deep-slate)' }}>About ProctorIQ</h1>
              <p className="lead text-muted">
                ProctorIQ is an advanced digital assessment platform designed to uphold the integrity of remote learning and examinations.
              </p>
              <p className="text-muted">
                Our mission is to provide educational institutions, teachers, and students with a seamless, secure, and stress-free testing environment. Utilizing state-of-the-art AI monitoring, identity verification, and deep analytics, ProctorIQ ensures that every assessment is fair and accurate.
              </p>
            </div>

            {/* FAQs */}
            <div>
              <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <HelpCircle className="text-accent" style={{ color: 'var(--accent-primary)' }} /> Frequently Asked Questions
              </h3>
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item border-0 mb-3 premium-card">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      How does the live proctoring work?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body text-muted">
                      We use webcam monitoring and browser lockdown to track user presence, detect multiple faces, and prevent tab switching during an exam.
                    </div>
                  </div>
                </div>
                <div className="accordion-item border-0 mb-3 premium-card">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      What happens if my internet disconnects?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body text-muted">
                      ProctorIQ caches your answers locally. A popup will alert you of the disconnection, and your progress will sync automatically once you are back online.
                    </div>
                  </div>
                </div>
                <div className="accordion-item border-0 mb-3 premium-card">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-semibold bg-transparent" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      Is my data safe?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body text-muted">
                      Yes. All data, including webcam snapshots and identity verification, is encrypted and securely stored in compliance with major privacy regulations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="col-lg-6">
            <div className="glass-card h-100">
              <h3 className="fw-bold mb-4">Contact Support</h3>
              
              <div className="d-flex flex-column gap-3 mb-5 text-muted">
                <div className="d-flex align-items-center gap-3">
                  <Mail style={{ color: 'var(--accent-primary)' }} /> paramvadher04@gmail.com
                </div>
                <div className="d-flex align-items-center gap-3">
                  <Phone style={{ color: 'var(--accent-primary)' }} /> 8238650390
                </div>
                <div className="d-flex align-items-center gap-3">
                  <MapPin style={{ color: 'var(--accent-primary)' }} /> Rajkot Gujarat
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}
              {submitted ? (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <HelpCircle /> Your message has been sent. We'll get back to you shortly!
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-custom" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Email</label>
                    <input 
                      type="email" 
                      className="form-control form-control-custom" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted">Message</label>
                    <textarea 
                      className="form-control form-control-custom" 
                      rows={4} 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary-custom w-100" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutContact;
