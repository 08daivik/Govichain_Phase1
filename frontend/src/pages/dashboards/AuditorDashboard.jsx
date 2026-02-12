import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, milestonesAPI } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AuditorDashboard.css';

const AuditorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myStats, setMyStats] = useState(null);
  const [pendingMilestones, setPendingMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [myStatsRes, pendingRes] = await Promise.all([
        dashboardAPI.getMyStats(),
        milestonesAPI.filterByStatus('PENDING'),
      ]);

      setMyStats(myStatsRes.data);
      setPendingMilestones(pendingRes.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.username}! 🔍</h1>
          <p>Review milestones and ensure compliance.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/milestones/pending')}>
          View Pending Reviews
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Pending Reviews"
          value={myStats?.pending_reviews || 0}
          icon="⏳"
          color="yellow"
        />
        <StatsCard
          title="Total Reviewed"
          value={myStats?.total_reviewed || 0}
          icon="📋"
          color="blue"
        />
        <StatsCard
          title="Approved"
          value={myStats?.approved || 0}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Flagged"
          value={myStats?.flagged || 0}
          icon="🚩"
          color="red"
        />
      </div>

      {/* Pending Reviews */}
      <div className="section">
        <div className="section-header">
          <h2>Pending Milestone Reviews</h2>
          <button className="btn btn-outline" onClick={() => navigate('/milestones/pending')}>
            View All
          </button>
        </div>

        {pendingMilestones.length > 0 ? (
          <div className="milestones-table-container card">
            <table className="milestones-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project ID</th>
                  <th>Amount</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMilestones.map((milestone) => (
                  <tr key={milestone.id}>
                    <td>
                      <strong>{milestone.title}</strong>
                      <p className="milestone-desc">{milestone.description}</p>
                    </td>
                    <td>{milestone.project_id}</td>
                    <td><strong>{formatCurrency(milestone.requested_amount)}</strong></td>
                    <td>{new Date(milestone.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/milestones/review/${milestone.id}`)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>✅ No pending reviews at the moment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditorDashboard;