import React from 'react';
import './About.css';
import StudentNav from '../../components/nav/StudentNav';

const About = () => {


  return (
    <>
    <div className="page-container">
      <StudentNav className="student-nav" />
      <div className="about-container">
        <div className="about-box">
          <h2 className="about-title">
            About English Proficiency Online Exam System
          </h2>
          <p className="about-description">
            The <strong>English Proficiency Online Exam System</strong> is a comprehensive platform designed to assess and enhance the English language skills of users through a streamlined and secure online environment.
          </p>
          <p className="about-description">
            This system evaluates various aspects of English proficiency, including:
          </p>
          <ul className="about-list">
            <li>Reading Comprehension</li>
            <li>Listening Skills</li>
            <li>Grammar and Vocabulary</li>
            <li>Writing Ability</li>
          </ul>
          <p className="about-description">
            Our platform is designed to ensure accurate evaluation with real-time scoring and personalized feedback to help users identify their strengths and areas for improvement.
          </p>
          <p className="about-description">
            With an intuitive interface and seamless user experience, the English Proficiency Online Exam System aims to provide a reliable and efficient solution for learners, educators, and institutions.
          </p>

        </div>
        <p className='footer'>© 2025 SPC INTERNS. All Rights Reserved.</p>
      </div>
      
    </div>
    </>
  );
};

export default About;
