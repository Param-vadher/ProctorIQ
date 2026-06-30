import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, PolarArea } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/student/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchDashboard();
  }, []);

  if (!stats) return <div className="p-5 text-center">Loading Dashboard...</div>;

  const polarData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [stats.passedExams, stats.failedExams],
        backgroundColor: [
          'rgba(52, 211, 153, 0.7)',
          'rgba(244, 63, 94, 0.7)'
        ],
        hoverBackgroundColor: [
          'rgba(52, 211, 153, 1)',
          'rgba(244, 63, 94, 1)'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderColor: '#f8fafc',
      },
    ],
  };

  const polarOptions = {
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeInOutCirc' as const,
    },
    scales: {
      r: {
        ticks: { display: false },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        angleLines: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#334155',
          font: { family: "'Inter', sans-serif", size: 14, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#0ea5e9',
        bodyColor: '#334155',
        borderColor: 'rgba(14, 165, 233, 0.3)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
      }
    }
  };

  const lineData = {
    labels: stats.submissions.map((s: any) => s.examId?.title || 'Unknown'),
    datasets: [
      {
        label: 'Score Achieved',
        data: stats.submissions.map((s: any) => s.score),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#38bdf8',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: '#38bdf8',
        pointHoverBorderColor: '#0a1930',
        pointHoverBorderWidth: 3,
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const lineOptions = {
    maintainAspectRatio: false,
    animation: {
      duration: 2500,
      easing: 'easeOutElastic' as const,
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        border: { display: false },
        ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b', padding: 10 }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b', padding: 10 }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#0ea5e9',
        bodyColor: '#334155',
        borderColor: 'rgba(14, 165, 233, 0.3)',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 12,
        titleFont: { size: 15, family: "'Inter', sans-serif", weight: 'bold' as const },
        bodyFont: { size: 14, family: "'Inter', sans-serif" },
      }
    }
  };

  return (
    <div className="container-fluid py-4 fade-in">

      {/* Page Title */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--primary-deep-slate)' }}>My Dashboard</h4>
        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Track your performance &amp; exam history</p>
      </div>

      {/* Metrics Row */}
      <div className="row mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="col-md-3 mb-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 me-3" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="mb-0">{stats.examsTaken}</h3>
              <span className="text-muted small">Exams Taken</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 me-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="mb-0">{stats.passedExams}</h3>
              <span className="text-muted small">Passed Exams</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 me-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="mb-0">{stats.failedExams}</h3>
              <span className="text-muted small">Failed Exams</span>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="premium-card p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 me-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="mb-0">{stats.averageScore.toFixed(1)}</h3>
              <span className="text-muted small">Avg Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row mb-5 fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="col-md-4 mb-4">
          <div className="premium-card p-4 h-100 d-flex flex-column">
            <h5 className="mb-4 text-center fw-bold" style={{ color: 'var(--text-primary)' }}>Pass/Fail Ratio</h5>
            <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
              <PolarArea data={polarData} options={polarOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-8 mb-4">
          <div className="premium-card p-4 h-100 d-flex flex-column">
            <h5 className="mb-4 fw-bold" style={{ color: 'var(--text-primary)' }}>Subject Strength &amp; Scores</h5>
            <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
