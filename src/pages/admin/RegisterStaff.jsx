import React, { useState } from 'react';
import { db, auth } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AdminNav from '../../components/nav/AdminNav';
import './RegisterStaff.css';

const RegisterStaff = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        firstName,
        lastName,
        contactNumber,
        email,
        role: 'admin',
      });

      setFirstName('');
      setLastName('');
      setContactNumber('');
      setEmail('');
      setPassword('');
      setSuccess('Staff registered successfully!');
      setError('');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error registering staff. Please try again.');
    }
  };

  return (
    <>
      <AdminNav />
      <div className="register-container">
        <div className="register-card">
          <h2 className="register-title">Register Staff</h2>
          {error && <p className="register-error">{error}</p>}
          {success && <p className="register-success">{success}</p>}

          <form onSubmit={handleRegister} className="register-form">
            <input
              type="text"
              className="register-input"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              className="register-input"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <input
              type="text"
              className="register-input"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
            <input
              type="email"
              className="register-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="register-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="register-button">Register Staff</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterStaff;
