import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { milestonesAPI, projectsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './MilestoneReview.css';

const MilestoneReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [milestone, setMilestone] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMilestoneDetails = useCallback(async () => {
    try {
      setLoading(true);
      const milestoneRes = await milestonesAPI.getById(id);
      setMilestone(milestoneRes.data);

      const projectRes = await projectsAPI.getById(milestoneRes.data.project_id);
      setProject(projectRes.data);
    } catch (error) {
      console.error('Failed to load milestone:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMilestoneDetails();
  }, [loadMilestoneDetails]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this milestone?')) return;

    try {
      setActionLoading(true);
      await milestonesAPI.approve(id);
      alert('Milestone approved successfully! ✅');
      navigate('/milestones/pending');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to approve milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    if (!window.confirm('Are you sure you want to flag this milestone as suspicious?')) return;

    try {
      setActionLoading(true);
      await milestonesAPI.flag(id);
      alert('Milestone flagged successfully! 🚩');
      navigate('/milestones/pending');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to flag milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading milestone details..." />;
  }

  if (!milestone) {
    return <div>Milestone not found</div>;
  }

  return (
    <div className="milestone-review-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Review Milestone</h1>
      </div>

      <div className="review-container">
        <div className="milestone-details card">
          <h2>Milestone Details</h2>

          <div className="detail-row">
            <span className="label">Title:</span>
            <span className="value">{milestone.title}</span>
          </div>

          <div className="detail-row">
            <span className="label">Description:</span>
            <span className="value">{milestone.description || 'No description provided'}</span>
          </div>

          <div className="detail-row">
            <span className="label">Requested Amount:</span>
            <span className="value amount">{formatCurrency(milestone.requested_amount)}</span>
          </div>

          <div className="detail-row">
            <span className="label">Status:</span>
            <span className="badge badge-warning">{milestone.status}</span>
          </div>

          <div className="detail-row">
            <span className="label">Contractor ID:</span>
            <span className="value">{milestone.contractor_id}</span>
          </div>

          <div className="detail-row">
            <span className="label">Created:</span>
            <span className="value">{new Date(milestone.created_at).toLocaleString()}</span>
          </div>

          {project && (
            <>
              <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Project Information</h3>
              
              <div className="detail-row">
                <span className="label">Project Name:</span>
                <span className="value">{project.name}</span>
              </div>

              <div className="detail-row">
                <span className="label">Project Budget:</span>
                <span className="value">{formatCurrency(project.budget)}</span>
              </div>

              <div className="detail-row">
                <span className="label">Project Status:</span>
                <span className={`badge badge-${project.status === 'COMPLETED' ? 'success' : 'info'}`}>
                  {project.status}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="action-panel card">
          <h3>Review Actions</h3>
          <p>As an auditor, you can approve or flag this milestone based on your review.</p>

          <div className="action-buttons">
            <button
              className="btn btn-success btn-large"
              onClick={handleApprove}
              disabled={actionLoading || milestone.status !== 'PENDING'}
            >
              ✓ Approve Milestone
            </button>

            <button
              className="btn btn-danger btn-large"
              onClick={handleFlag}
              disabled={actionLoading || milestone.status !== 'PENDING'}
            >
              🚩 Flag as Suspicious
            </button>
          </div>

          {milestone.status !== 'PENDING' && (
            <div className="info-message">
              <p>⚠️ This milestone has already been reviewed.</p>
            </div>
          )}

          <div className="guidelines">
            <h4>Review Guidelines:</h4>
            <ul>
              <li>Verify deliverables match description</li>
              <li>Check if amount is reasonable</li>
              <li>Ensure compliance with project scope</li>
              <li>Flag if suspicious or incomplete</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneReview;