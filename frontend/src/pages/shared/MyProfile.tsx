import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Camera, Save, Loader2, CheckCircle, ArrowLeft, XCircle, Lock } from 'lucide-react';
import api from '../../services/api';

const MyProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  // Password State
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setProfilePicture(data.profilePicture || '');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file.');
      return;
    }

    // Client-side image resizing via Canvas
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert back to base64 (jpeg for smaller size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfilePicture(dataUrl);
      };
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.put('/auth/profile', { name, phone, profilePicture });
      setSuccessMsg('Profile updated successfully!');
      
      // Update local storage user data so navbar updates immediately if it relies on local storage (optional)
      const token = localStorage.getItem('token');
      if (token) {
        // We could refresh context here, or trigger a custom event
        window.dispatchEvent(new Event('profileUpdated'));
      }
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setPassErrorMsg('New passwords do not match');
      return;
    }
    
    setChangingPass(true);
    setPassSuccessMsg('');
    setPassErrorMsg('');

    try {
      await api.put('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      setPassSuccessMsg('Password updated successfully!');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccessMsg(''), 3000);
    } catch (err: any) {
      setPassErrorMsg(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return <div className="container-fluid py-5 text-center text-muted fade-in">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="container-fluid py-5 text-center text-danger fade-in">Failed to load profile.</div>;
  }

  return (
    <div className="container-fluid py-4 fade-in" style={{ maxWidth: '800px' }}>
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline-secondary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-deep-slate)' }}>My Profile</h2>
          <p className="text-muted mb-0">Manage your personal information and account settings.</p>
        </div>
      </div>

      <div className="premium-card p-4 p-md-5">
        <form onSubmit={handleSave}>
          
          {/* Avatar Section */}
          <div className="d-flex flex-column align-items-center mb-5">
            <div className="position-relative mb-3 group" style={{ width: '120px', height: '120px' }}>
              <div 
                className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center shadow-sm"
                style={{ 
                  width: '100%', height: '100%', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '3px solid var(--border-color)',
                  backgroundImage: `url(${profilePicture})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!profilePicture && <User size={48} className="text-muted opacity-50" />}
              </div>
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="position-absolute btn btn-primary rounded-circle p-2 shadow"
                style={{ bottom: 0, right: 0, width: '36px', height: '36px', zIndex: 10 }}
                title="Change Photo"
              >
                <Camera size={16} className="position-absolute top-50 start-50 translate-middle" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="d-none" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{profile.name}</h5>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 text-capitalize">
              {profile.role} Account
            </span>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', opacity: 0.5, margin: '2rem 0' }} />

          {/* Form Fields */}
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">FULL NAME</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-transparent">
                  <User size={18} className="text-muted" />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">EMAIL ADDRESS</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-transparent">
                  <Mail size={18} className="text-muted" />
                </span>
                <input 
                  type="email" 
                  className="form-control border-start-0 ps-0 text-muted" 
                  value={profile.email} 
                  disabled
                  title="Email cannot be changed"
                />
              </div>
              <div className="form-text mt-1" style={{ fontSize: '11px' }}>Contact support to change your email.</div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">PHONE NUMBER</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-transparent">
                  <Phone size={18} className="text-muted" />
                </span>
                <input 
                  type="tel" 
                  className="form-control border-start-0 ps-0" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">JOINED DATE</label>
              <input 
                type="text" 
                className="form-control text-muted" 
                value={new Date(profile.createdAt).toLocaleDateString()} 
                disabled
              />
            </div>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="alert alert-danger d-flex align-items-center mt-4 mb-0 py-2">
              <XCircle size={18} className="me-2" /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success d-flex align-items-center mt-4 mb-0 py-2">
              <CheckCircle size={18} className="me-2" /> {successMsg}
            </div>
          )}

          {/* Actions */}
          <div className="d-flex justify-content-end mt-5 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
            <button 
              type="submit" 
              className="btn btn-primary-custom d-flex align-items-center"
              disabled={saving}
            >
              {saving ? <Loader2 size={18} className="me-2 animate-spin" /> : <Save size={18} className="me-2" />}
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>

      <div className="premium-card p-4 p-md-5 mt-4">
        <h4 className="fw-bold mb-4 d-flex align-items-center" style={{ color: 'var(--primary-deep-slate)' }}>
          <Lock size={20} className="me-2 text-primary" /> Security Options
        </h4>
        <form onSubmit={handleChangePassword}>
          <div className="row g-4">
            <div className="col-md-12">
              <label className="form-label small fw-bold text-muted mb-2">CURRENT PASSWORD</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter current password"
                value={passData.currentPassword}
                onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">NEW PASSWORD</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter new password"
                value={passData.newPassword}
                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                required
                minLength={8}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">CONFIRM NEW PASSWORD</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Confirm new password"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                required
                minLength={8}
              />
            </div>
          </div>

          {passErrorMsg && (
            <div className="alert alert-danger d-flex align-items-center mt-4 mb-0 py-2">
              <XCircle size={18} className="me-2" /> {passErrorMsg}
            </div>
          )}
          {passSuccessMsg && (
            <div className="alert alert-success d-flex align-items-center mt-4 mb-0 py-2">
              <CheckCircle size={18} className="me-2" /> {passSuccessMsg}
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <button 
              type="submit" 
              className="btn btn-outline-primary d-flex align-items-center"
              disabled={changingPass}
            >
              {changingPass ? <Loader2 size={18} className="me-2 animate-spin" /> : <Lock size={18} className="me-2" />}
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
