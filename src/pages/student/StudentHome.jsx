import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentHome.css'; // Import the CSS file

const StudentHome = () => {
  const navigate = useNavigate();

  // Navigate to exams page when "Get Started" is clicked
  const handleGetStarted = () => {
    navigate('/exams');
  };

  return (
    <div className="student-home-container">
      <h1 className="student-home-title">
        Welcome to the Online Exam System!
      </h1>
      <p className="student-home-description">
        Click below to get started with your exam.
      </p>
      <div className="button-container">
        <button className="get-started-button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default StudentHome;
