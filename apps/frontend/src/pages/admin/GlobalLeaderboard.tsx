import React from 'react';
import { Trophy, Medal } from 'lucide-react';

const GlobalLeaderboard: React.FC = () => {
  const leaders: any[] = [];

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>Global Leaderboard</h2>
          <p className="text-muted mb-0">High-performing students across various subjects and branches.</p>
        </div>
        <select className="form-select form-control-custom" style={{ width: '200px' }}>
          <option>All Subjects</option>
          <option>Data Structures</option>
          <option>Operating Systems</option>
        </select>
      </div>

      <div className="premium-card p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: '80px' }}>Rank</th>
                <th>Student Name</th>
                <th>Branch</th>
                <th>Top Subject</th>
                <th className="text-end">Aggregate Score</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader) => (
                <tr key={leader.rank}>
                  <td className="text-center fw-bold">
                    {leader.rank === 1 && <Trophy size={20} className="text-warning" />}
                    {leader.rank === 2 && <Medal size={20} style={{ color: '#94a3b8' }} />}
                    {leader.rank === 3 && <Medal size={20} style={{ color: '#b45309' }} />}
                    {leader.rank > 3 && leader.rank}
                  </td>
                  <td className="fw-semibold">{leader.name}</td>
                  <td>{leader.branch}</td>
                  <td>{leader.subject}</td>
                  <td className="text-end fw-bold" style={{ color: 'var(--accent-primary)' }}>
                    {leader.score}
                  </td>
                </tr>
              ))}
              {leaders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;
