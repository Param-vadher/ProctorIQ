import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Search, UserPlus, Shield, User, GraduationCap } from 'lucide-react';

const roleMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  admin:   { label: 'Admin',   color: '#ef4444', icon: <Shield      size={11} className="me-1" /> },
  teacher: { label: 'Teacher', color: '#8b5cf6', icon: <User        size={11} className="me-1" /> },
  student: { label: 'Student', color: '#0ea5e9', icon: <GraduationCap size={11} className="me-1" /> },
};

const UserAccountsManager: React.FC = () => {
  const [searchTerm, setSearchTerm]   = useState('');
  const [users, setUsers]             = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [formData, setFormData]       = useState({ name: '', email: '', password: '', role: 'teacher' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) { console.error(err); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'teacher' });
      fetchUsers();
    } catch { alert('Failed to create user'); }
  };

  const handleDelete = async (id: string) => {
    setDeleteError('');
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete';
      setDeleteError(msg);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>User Accounts</h2>
          <p className="text-muted mb-0 small">Manage student and teacher credentials globally.</p>
        </div>
        <button className="btn btn-primary-custom d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> Add User
        </button>
      </div>

      {deleteError && (
        <div className="alert alert-danger d-flex align-items-center mb-3 rounded-3 fade-in" role="alert">
          <Shield size={16} className="me-2 flex-shrink-0" />
          {deleteError}
        </div>
      )}

      <div className="premium-card p-4">
        {/* Search */}
        <div className="position-relative mb-4" style={{ maxWidth: '400px' }}>
          <Search className="position-absolute text-muted" size={16} style={{ left: '14px', top: '12px' }} />
          <input
            type="text"
            className="form-control form-control-custom ps-5"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th className="py-3 px-3 small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '8px 0 0 0' }}>Name</th>
                <th className="py-3 px-3 small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>Email</th>
                <th className="py-3 px-3 small fw-bold text-uppercase" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>Role</th>
                <th className="py-3 px-3 small fw-bold text-uppercase text-end" style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '0 8px 0 0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const meta = roleMeta[user.role] || roleMeta.student;
                return (
                  <tr
                    key={user._id}
                    className="user-table-row"
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      animation: `fadeInUp 0.4s ease both`,
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    <td className="py-3 px-3 fw-semibold" style={{ color: 'var(--text-primary)' }}>{user.name}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className="d-inline-flex align-items-center px-2 py-1 rounded-pill fw-semibold"
                        style={{
                          fontSize: '11px',
                          backgroundColor: meta.color + '22',
                          color: meta.color,
                          border: `1px solid ${meta.color}44`,
                          letterSpacing: '0.03em',
                        }}
                      >
                        {meta.icon}{meta.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-end">
                      {user.role !== 'admin' ? (
                        <button
                          className="btn btn-sm rounded-2 d-inline-flex align-items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.08)',
                            color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.2)',
                            transition: 'all 0.2s ease',
                          }}
                          title="Delete user"
                          onClick={() => handleDelete(user._id)}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.08)';
                            (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span className="badge rounded-pill" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '10px' }}>
                          Protected
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>
                    <Search size={32} className="mb-2 opacity-25 d-block mx-auto" />
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ animation: 'fadeInUp 0.3s ease' }}>
            <div className="modal-content border-0 shadow-xl" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', color: 'var(--text-primary)' }}>
              <div className="modal-header" style={{ borderColor: 'var(--border-color)' }}>
                <h5 className="modal-title fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>
                  <UserPlus size={20} className="me-2" />Add New User
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} style={{ filter: 'var(--btn-close-filter, none)' }} />
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleAddUser}>
                  {(['Full Name', 'Email', 'Password'] as const).map((label, i) => {
                    const keys = ['name', 'email', 'password'] as const;
                    const types = ['text', 'email', 'text'] as const;
                    return (
                      <div className="mb-3" key={label}>
                        <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                        <input
                          type={types[i]}
                          className="form-control form-control-custom"
                          required
                          value={(formData as any)[keys[i]]}
                          onChange={e => setFormData({ ...formData, [keys[i]]: e.target.value })}
                        />
                      </div>
                    );
                  })}
                  <div className="mb-4">
                    <label className="form-label small fw-bold" style={{ color: 'var(--text-secondary)' }}>Role</label>
                    <select className="form-select form-control-custom" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary-custom w-100 fw-bold">
                    Create Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountsManager;
