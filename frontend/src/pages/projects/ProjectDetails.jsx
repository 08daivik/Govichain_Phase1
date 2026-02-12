import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, milestonesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [projectRes, progressRes, milestonesRes] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getProgress(id),
        milestonesAPI.getByProject(id),
      ]);

      setProject(projectRes.data);
      setProgress(progressRes.data);
      setMilestones(milestonesRes.data);
    } catch (error) {
      console.error('Failed to load project details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  const getStatusBadge = (status) => {
    const badges = {
      CREATED: 'badge-info',
      IN_PROGRESS: 'badge-warning',
      COMPLETED: 'badge-success',
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
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="project-details-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{project.name}</h1>
      </div>

      {/* Project Info Card */}
      <div className="project-info-card card">
        <div className="project-header">
          <div>
            <h2>{project.name}</h2>
            <span className={`badge ${getStatusBadge(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <div className="project-budget-large">
            {formatCurrency(project.budget)}
          </div>
        </div>

        <p className="project-description">{project.description || 'No description provided'}</p>

        <div className="project-meta">
          <div className="meta-item">
            <span className="label">Created:</span>
            <span className="value">{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <span className="label">Last Updated:</span>
            <span className="value">{new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {progress && (
        <div className="progress-section">
          <div className="progress-card card">
            <h3>Project Progress</h3>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.progress.completion_percentage}%` }}
                >
                  {progress.progress.completion_percentage}%
                </div>
              </div>
            </div>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-value">{progress.milestones.approved}</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat">
                <span className="stat-value">{progress.milestones.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat">
                <span className="stat-value">{progress.milestones.flagged}</span>
                <span className="stat-label">Flagged</span>
              </div>
            </div>
          </div>

          <div className="budget-card card">
            <h3>Budget Utilization</h3>
            <div className="budget-stats">
              <div className="budget-item">
                <span className="label">Total Budget:</span>
                <span className="value">{formatCurrency(progress.funds.total_requested + progress.funds.remaining_budget)}</span>
              </div>
              <div className="budget-item">
                <span className="label">Requested:</span>
                <span className="value">{formatCurrency(progress.funds.total_requested)}</span>
              </div>
              <div className="budget-item">
                <span className="label">Approved:</span>
                <span className="value green">{formatCurrency(progress.funds.approved_amount)}</span>
              </div>
              <div className="budget-item">
                <span className="label">Remaining:</span>
                <span className="value">{formatCurrency(progress.funds.remaining_budget)}</span>
              </div>
            </div>
            <div className="utilization-bar">
              <div
                className="utilization-fill"
                style={{ width: `${progress.progress.budget_utilization}%` }}
              ></div>
            </div>
            <p className="utilization-text">{progress.progress.budget_utilization}% Utilized</p>
          </div>
        </div>
      )}

      {/* Milestones Section */}
      <div className="milestones-section card">
        <div className="section-header">
          <h3>Milestones ({milestones.length})</h3>
          {user?.role === 'CONTRACTOR' && (
            <button className="btn btn-primary" onClick={() => navigate('/milestones/create', { state: { projectId: id } })}>
              ➕ Add Milestone
            </button>
          )}
        </div>

        {milestones.length > 0 ? (
          <div className="milestones-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((milestone) => (
                  <tr key={milestone.id}>
                    <td>
                      <strong>{milestone.title}</strong>
                      <p className="milestone-desc">{milestone.description}</p>
                    </td>
                    <td>{formatCurrency(milestone.requested_amount)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </td>
                    <td>{new Date(milestone.created_at).toLocaleDateString()}</td>
                    <td>
                      {user?.role === 'AUDITOR' && milestone.status === 'PENDING' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/milestones/review/${milestone.id}`)}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-small">
            <p>No milestones yet for this project</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;