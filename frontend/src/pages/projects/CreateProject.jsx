import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import './CreateProject.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const projectData = {
        ...formData,
        budget: parseFloat(formData.budget),
      };

      await projectsAPI.create(projectData);
      alert('Project created successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Create New Project</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="project-form">
          {error && (
            <div className="error-banner">
              <span>❌</span>
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Highway Construction Project"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={3}
            />
            <small>Minimum 3 characters</small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the project objectives, scope, and expected outcomes..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Budget (₹) *</label>
            <input
              type="number"
              name="budget"
              placeholder="e.g., 10000000"
              value={formData.budget}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
            />
            <small>Budget must be greater than 0</small>
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
              {loading ? 'Creating...' : '✓ Create Project'}
            </button>
          </div>
        </form>

        <div className="info-card">
          <h3>💡 Project Creation Tips</h3>
          <ul>
            <li>Choose a clear, descriptive project name</li>
            <li>Provide detailed objectives and scope</li>
            <li>Set a realistic budget allocation</li>
            <li>Projects start with "CREATED" status</li>
            <li>Contractors can create milestones once approved</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;