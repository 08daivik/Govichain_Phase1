import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/projects', label: 'All Projects', icon: '📁' },
    ];

    if (user?.role === 'GOVERNMENT') {
      baseItems.push(
        { path: '/projects/create', label: 'Create Project', icon: '➕' },
        { path: '/projects/my-projects', label: 'My Projects', icon: '📋' }
      );
    }

    if (user?.role === 'CONTRACTOR') {
      baseItems.push(
        { path: '/milestones/create', label: 'Create Milestone', icon: '🎯' },
        { path: '/milestones/my-milestones', label: 'My Milestones', icon: '📝' }
      );
    }

    if (user?.role === 'AUDITOR') {
      baseItems.push(
        { path: '/milestones/pending', label: 'Pending Reviews', icon: '⏳' }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;