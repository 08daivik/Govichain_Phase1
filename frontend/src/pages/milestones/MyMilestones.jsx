import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { milestonesAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './MyMilestones.css';

const MyMilestones = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyMilestones();
  }, []);

  const loadMyMilestones = async () => {
    try {
      setLoading(true);
      const response = await milestonesAPI.getMyMilestones();
      setMilestones(response.data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      FLAGGED: 'badge-danger',
    };
    return badges[status] || 'badge-info';
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading your milestones..." />;
  }

  return (
    <div className="my-milestones-page">
      <div className="page-header">
        <h1>My Milestones</h1>
        <button className="btn btn-primary" onClick={() => navigate('/milestones/create')}>
          ➕ Create Milestone
        </button>
      </div>

      {milestones.length > 0 ? (
        <div className="milestones-table-container card">
          <table className="milestones-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Project ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone) => (
                <tr key={milestone.id}>
                  <td>{milestone.id}</td>
                  <td>
                    <strong>{milestone.title}</strong>
                    <p className="milestone-desc">{milestone.description}</p>
                  </td>
                  <td>{milestone.project_id}</td>
                  <td>{formatCurrency(milestone.requested_amount)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </td>
                  <td>{new Date(milestone.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/projects/${milestone.project_id}`)}
                    >
                      View Project
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>📭 You haven't created any milestones yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/milestones/create')}>
            Create Your First Milestone
          </button>
        </div>
      )}
    </div>
  );
};

export default MyMilestones;