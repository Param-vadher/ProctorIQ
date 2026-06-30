import React, { useState } from 'react';
import { Shield, Settings, Server } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [warningsLimit, setWarningsLimit] = useState(3);
  const [retentionDays, setRetentionDays] = useState(30);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System settings saved successfully!');
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4 fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>System Settings & Lockdown Configurator</h2>
      <p className="text-muted mb-4">Modify security thresholds, set default proctoring limits, and manage retention.</p>

      <form onSubmit={handleSave} className="row g-4">
        {/* Security Settings */}
        <div className="col-md-6">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Shield className="text-primary" /> Security Thresholds
            </h5>
            <div className="mb-3">
              <label className="form-label text-muted">Default Proctoring Warning Limit</label>
              <div className="input-group">
                <input 
                  type="number" 
                  className="form-control form-control-custom" 
                  value={warningsLimit}
                  onChange={(e) => setWarningsLimit(Number(e.target.value))}
                />
                <span className="input-group-text" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>Warnings</span>
              </div>
              <div className="form-text">Number of warnings before auto-submitting the exam.</div>
            </div>
            
            <div className="mb-3 mt-4">
              <label className="form-label text-muted">Face Detection Sensitivity</label>
              <select className="form-select form-control-custom">
                <option value="low">Low (Tolerant)</option>
                <option value="medium" selected>Medium (Standard)</option>
                <option value="high">High (Strict)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Settings */}
        <div className="col-md-6">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Server className="text-success" /> Global Data & Backup
            </h5>
            <div className="mb-3">
              <label className="form-label text-muted">Backup Retention Rules</label>
              <div className="input-group">
                <input 
                  type="number" 
                  className="form-control form-control-custom" 
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                />
                <span className="input-group-text" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>Days</span>
              </div>
              <div className="form-text">How long to keep webcam snapshots and exam logs.</div>
            </div>

            <div className="form-check form-switch mt-4">
              <input className="form-check-input" type="checkbox" id="maintenanceMode" />
              <label className="form-check-label text-muted" htmlFor="maintenanceMode">
                Enable Maintenance Mode
              </label>
              <div className="form-text">Prevents new logins while active.</div>
            </div>
          </div>
        </div>

        <div className="col-12 mt-4 text-end">
          <button type="submit" className="btn btn-primary-custom d-flex align-items-center gap-2 ms-auto">
            <Settings size={18} /> Apply Global Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
