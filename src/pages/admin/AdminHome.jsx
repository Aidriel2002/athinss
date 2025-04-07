import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/nav/AdminNav';
import { handleLogout } from '../../auth/Logout'; 
import './AdminHome.css';  // Import the CSS file

const AdminHome = () => {
  const navigate = useNavigate();

  // Define features with paths
  const features = [
    { title: 'Manage Users', description: 'Approve, block, and manage users.', icon: '👥', path: '/manage-users' },
    { title: 'Manage Exams', description: 'Create and manage online exams.', icon: '📝', path: '/manage-exams' },
    { title: 'Review Results', description: 'View and analyze exam results.', icon: '📊', path: '/review-result'},
  ];

  // Handle click navigation
  const handleFeatureClick = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-home">
      <AdminSidebar handleLogout={() => handleLogout(navigate)} />
      <h1 className="dashboard-title">DASHBOARD</h1>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index} onClick={() => handleFeatureClick(feature.path)}>
            <div className="feature-card-content">
              <h3 className="feature-title">
                {feature.icon} {feature.title}
              </h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
