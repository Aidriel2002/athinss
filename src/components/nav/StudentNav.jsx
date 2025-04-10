import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleLogout } from '../../auth/Logout'; // Import the handleLogout function
import './StudentNav.css'; // Import the CSS file

const StudentNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Home', route: '/exams' },
    { text: 'Manage Account', route: '/manage-account' },
    { text: 'About', route: '/about' },
    
  ];

  return (
    <div className="student-nav">
      <div className="student-nav-header">
        <img
          src="/logo-icon.png"
          alt="Athena Logo"
          className="student-nav-logo"
        />
        <span className="student-nav-title">Athins Online Exam</span>
      </div>

      <hr className="divider" />

      <ul className="menu-list">
        {menuItems.map((item) => (
          <li
            key={item.text}
            className={`menu-item ${location.pathname === item.route ? 'active' : ''}`}
          >
            <button
              className="menu-button"
              onClick={() => navigate(item.route)}
            >
              <span className="menu-text">{item.text}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="student-nav-logout">
        <button
          className="logout-menu-button"
          onClick={() => handleLogout(navigate)} 
        >
          <span className="menu-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StudentNav;
