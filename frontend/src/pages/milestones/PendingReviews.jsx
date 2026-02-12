import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { milestonesAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './PendingReviews.css';

const PendingReviews = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingMilestones();
  }, []);

  const loadPendingMilestones = async () => {
    try {
      setLoading(true);
      const response = await milestonesAPI.filterByStatus('PENDING');
      setMilestones(response.data);
    } catch (error) {
      console.error('Failed to load pending milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading pending reviews..." />;
  }

  return (
    <div className="pending-reviews-page">
      <div className="page-header">
        <h1>Pending Reviews</h1>
        <span className="pending-count">{milestones.length} pending</span>
      </div>

      {milestones.length > 0 ? (
        <div className="milestones-table-container card">
          <table className="milestones-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Project ID</th>
                <th>Contractor</th>
                <th>Amount</th>
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
                  <td>ID: {milestone.contractor_id}</td>
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
          <p>✅ No pending reviews at the moment</p>
        </div>
      )}
    </div>
  );
};

export default PendingReviews;