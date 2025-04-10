import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaCircle } from 'react-icons/fa';

const Login = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'student',
        });
        navigate('/user-home');
      } else {
        const role = userSnap.data().role;
        role === 'admin' ? navigate('/admin-home') : navigate('/user-home');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;
        if (role === 'admin') {
          navigate('/admin-home');
        } else {
          setError('This account is not an admin.');
        }
      } else {
        setError('No such user found in database.');
      }
    } catch (err) {
      setError('Invalid credentials.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setError('Password reset email sent. Please check your inbox.');
      setShowResetForm(false);
    } catch (err) {
      setError('Error sending password reset email. Please try again.');
    }
  };

  return (
    <div className="login-container">
      
    <div className="login-card">
    
      <h1 className="title"><FaCircle className="my-circle" color="#FF4C4C" />
      <FaCircle className="my-circle"  color="#FFD93D" />
      <FaCircle className="my-circle"  color="#08EC22" />
      &nbsp;&nbsp;ATHENA INSTITUTE OF TRAINING AND ASSESSMENT INC.</h1>
      {error && <p className="error-text">{error}</p>}
      <div className="login-content">
        <div className="leftpage">
          <div className="left-content">
            <h2>LOG IN</h2>
            <form onSubmit={handleAdminLogin} className="admin-login-form">
              <input
                type="email"
                placeholder="Enter your Username"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Enter your Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <button type="submit" className="login-button">LOG IN</button>
            </form>
            <p className="forgot-password" onClick={() => setShowResetForm(true)}>
            Forgot Password?
          </p>
  
            <div className="student-divider">-------- Login as Student --------</div>
            <button className="google-button" onClick={handleGoogleLogin}>
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google icon" />
              Continue with Google
            </button>
          </div>
  
          
          {showResetForm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <span className="close-modal" onClick={() => setShowResetForm(false)}>&times;</span>
      <form onSubmit={handleForgotPassword} className="reset-password-form">
        <h3>Reset Password</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
        />
        <button type="submit" className="reset-button">Send Reset Email</button>
      </form>
    </div>
  </div>
)}

        </div>

        <div className="rightpage">
          <img
            src="logo.png"
            alt="Athena Logo"
            className="logo-athens"
          />
        </div>
      </div>
    </div>
    
  </div>
  

  );
};

export default Login;
