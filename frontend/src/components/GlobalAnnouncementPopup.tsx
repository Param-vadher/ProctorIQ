import React, { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import api from '../services/api';

const GlobalAnnouncementPopup = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await api.get('/announcements/unread');
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleMarkAsRead = async () => {
    if (announcements.length === 0) return;
    try {
      const current = announcements[currentIndex];
      await api.post(`/announcements/${current._id}/read`);
      if (currentIndex < announcements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="bg-white rounded p-4 shadow-lg position-relative fade-in mx-3" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="d-flex align-items-center mb-3 text-primary">
          <Megaphone size={28} className="me-2" />
          <h4 className="mb-0 fw-bold">{currentAnnouncement.type === 'global' ? 'Global Announcement' : 'Exam Announcement'}</h4>
        </div>
        <h5 className="fw-bold text-dark">{currentAnnouncement.title}</h5>
        <p className="text-muted mt-2" style={{ whiteSpace: 'pre-wrap' }}>
          {currentAnnouncement.message}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="small text-muted">
            {currentIndex + 1} of {announcements.length}
          </span>
          <button className="btn btn-primary-custom" onClick={handleMarkAsRead}>
            Mark as Read & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAnnouncementPopup;
