import React, { useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const navigate = useNavigate();

  // Google Login (Student)
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

  // Admin Login
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

  // Admin Registration (Temporary)
  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    try {
      const result = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'admin',
      });

      setRegisterSuccess('Admin account created successfully!');
      setRegisterEmail('');
      setRegisterPassword('');
    } catch (err) {
      console.error('Admin registration error:', err);
      setRegisterError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Student Login</h2>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>

      <h2 style={{ marginTop: '2rem' }}>Admin Login</h2>
      <form onSubmit={handleAdminLogin}>
        <input
          type="email"
          placeholder="Admin Email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login as Admin</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3 style={{ marginTop: '2rem' }}>Register Admin (Temporary)</h3>
      <form onSubmit={handleAdminRegister}>
        <input
          type="email"
          placeholder="New Admin Email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="New Admin Password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Register Admin</button>
      </form>
      {registerError && <p style={{ color: 'red' }}>{registerError}</p>}
      {registerSuccess && <p style={{ color: 'green' }}>{registerSuccess}</p>}
    </div>
  );
};

export default Login;
