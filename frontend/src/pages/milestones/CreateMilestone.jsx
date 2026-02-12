import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectsAPI, milestonesAPI } from '../../services/api';
import './CreateMilestone.css';

const CreateMilestone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: location.state?.projectId || '',
    title: '',
    description: '',
    requested_amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const milestoneData = {
        ...formData,
        project_id: parseInt(formData.project_id),
        requested_amount: parseFloat(formData.requested_amount),
      };

      await milestonesAPI.create(milestoneData);
      alert('Milestone created successfully! 🎉');
      navigate(`/projects/${formData.project_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-milestone-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Create New Milestone</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="milestone-form">
          {error && (
            <div className="error-banner">
              <span>❌</span>
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label>Select Project *</label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose a project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Milestone Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Foundation Work Completion"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the milestone deliverables and completion criteria..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Requested Amount (₹) *</label>
            <input
              type="number"
              name="requested_amount"
              placeholder="e.g., 1000000"
              value={formData.requested_amount}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
            />
            <small>Amount must be within project budget</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '✓ Create Milestone'}
            </button>
          </div>
        </form>

        <div className="info-card">
          <h3>💡 Milestone Guidelines</h3>
          <ul>
            <li>Select the project this milestone belongs to</li>
            <li>Provide clear, measurable deliverables</li>
            <li>Request amount within project budget</li>
            <li>Milestones start in PENDING status</li>
            <li>Auditors will review and approve</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateMilestone;