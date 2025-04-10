import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminNav.css'; 
import { handleLogout } from '../../auth/Logout';

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState('/admin-home');

  useEffect(() => {
    setActiveNav(location.pathname);
  }, [location]);

  const handleLogoClick = () => {
    navigate('/admin-home');
  };

  return (
    <div className="admin-nav">
      <div className="logo-container">
        <button className="logo-button" onClick={handleLogoClick}>
          <img src="logo-icon.png" alt="Athena Logo" className="logo-img" />
          <h2 className="logo-text">Athins Online Exam</h2>
        </button>
      </div>

      <div className="divider"></div>

      <ul className="nav-list">
        <li className={`nav-item ${activeNav === '/admin-home' ? 'active' : ''}`}>
          <button className="nav-button" onClick={() => navigate('/admin-home')}>
            <i className="nav-icon home-icon"></i>
            <span className="nav-text">Admin Home</span>
          </button>
        </li>
        <li className={`nav-item ${activeNav === '/manage-users' ? 'active' : ''}`}>
          <button className="nav-button" onClick={() => navigate('/manage-users')}>
            <i className="nav-icon group-icon"></i>
            <span className="nav-text">Manage Users</span>
          </button>
        </li>
        <li className={`nav-item ${activeNav === '/manage-exams' ? 'active' : ''}`}>
          <button className="nav-button" onClick={() => navigate('/manage-exams')}>
            <i className="nav-icon assignment-icon"></i>
            <span className="nav-text">Create Exam</span>
          </button>
        </li>
        <li className={`nav-item ${activeNav === '/manage-existing' ? 'active' : ''}`}>
          <button className="nav-button" onClick={() => navigate('/manage-existing')}>
            <i className="nav-icon list-icon"></i>
            <span className="nav-text">Manage Exams</span>
          </button>
        </li>
        <li className={`nav-item ${activeNav === '/review-exam' ? 'active' : ''}`}>
          <button className="nav-button" onClick={() => navigate('/review-exam')}>
            <i className="nav-icon review-icon"></i>
            <span className="nav-text">Review Exam</span>
          </button>
        </li>
        {/* New Register Staff menu */}
        <li className={`nav-item ${activeNav === '/register-staff' ? 'active' : ''}`}>
          <button className="nav-button" onClick={() => navigate('/register-staff')}>
            <i className="nav-icon staff-icon"></i>
            <span className="nav-text">Register Staff</span>
          </button>
        </li>
      </ul>

      <div className="student-nav-logout">
        <button className="logout-menu-button" onClick={() => handleLogout(navigate)}>
          <span className="menu-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
