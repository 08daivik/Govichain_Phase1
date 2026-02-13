import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, projectsAPI } from '../../services/api';
import StatsCard from '../../components/StatsCard';
import ProjectCard from '../../components/ProjectCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Folder, ClipboardList, IndianRupee, Clock } from 'lucide-react';
import './GovernmentDashboard.css';

const GovernmentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [myStats, setMyStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, myStatsRes, projectsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getMyStats(),
        projectsAPI.getMyProjects(),
      ]);

      console.log('Stats:', statsRes.data);
      console.log('My Stats:', myStatsRes.data);
      console.log('Projects:', projectsRes.data);

      setStats(statsRes.data);
      setMyStats(myStatsRes.data);
      setRecentProjects(projectsRes.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Prepare chart data
  const projectStatusData = stats?.project_status ? 
    Object.entries(stats.project_status)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.replace('_', ' '),
        value: value
      })) : [];

  const budgetData = stats?.budget ? [
    { 
      name: 'Budget Overview',
      Allocated: stats.budget.total_allocated || 0,
      Requested: stats.budget.total_requested || 0,
      Approved: stats.budget.total_approved || 0
    },
  ] : [];

 const COLORS = ['#1e3a8a', '#2563eb', '#0ea5e9', '#64748b'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.username}.</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
          <button className="btn btn-primary" onClick={() => navigate('/projects/create')}>
             Create New Project
          </button>
        </div>

      {/* Stats Cards */}
      <div className="stats-grid">
      <StatsCard
        title="Total Projects"
        value={stats?.total_projects || 0}
        icon={<Folder size={32} strokeWidth={1.8} />}
        color="blue"
      />

      <StatsCard
        title="My Projects"
        value={myStats?.projects_created || 0}
        icon={<ClipboardList size={32} strokeWidth={1.8} />}
        color="green"
      />

      <StatsCard
        title="Total Budget Allocated"
        value={`₹${((myStats?.total_budget_allocated || 0) / 10000000).toFixed(1)}Cr`}
        icon={<IndianRupee size={32} strokeWidth={1.8} />}
        color="yellow"
        subtitle={`₹${(myStats?.total_budget_allocated || 0).toLocaleString('en-IN')}`}
      />

      <StatsCard
        title="Pending Approvals"
        value={stats?.pending_approvals || 0}
        icon={<Clock size={32} strokeWidth={1.8} />}
        color="red"
      />

      </div>

      {/* Charts Section */}
      {(projectStatusData.length > 0 || budgetData.length > 0) && (
        <div className="charts-section">
          {projectStatusData.length > 0 && (
            <div className="chart-card">
              <h3>Project Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                  />
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={85}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {budgetData[0] && (budgetData[0].Allocated > 0 || budgetData[0].Requested > 0) && (
            <div className="chart-card">
              <h3>Budget Overview (₹ Crores)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                  <Tooltip formatter={(value) => `₹${(value / 10000000).toFixed(2)} Cr`} />
                  <Legend />
                <Bar dataKey="Allocated" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Requested" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Approved" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent Projects */}
      <div className="section">
        <div className="section-header">
          <h2>My Recent Projects</h2>
          <button className="btn btn-outline" onClick={() => navigate('/projects/my-projects')}>
            View All
          </button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="projects-grid">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
            <button className="btn btn-primary" onClick={() => navigate('/projects/create')}>
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentDashboard;