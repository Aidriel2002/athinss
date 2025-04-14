import React, { useEffect, useState } from 'react';
import { auth, db } from '../../services/firebase';
import {
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import {
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider
} from 'firebase/auth';
import AdminNav from '../../components/nav/AdminNav';
import './AdminAccount.css';

const AdminAccount = () => {
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const user = auth.currentUser;
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAdminData({ ...docSnap.data(), email: user.email });
        }
      } catch (err) {
        showError('Failed to fetch admin data.');
      }
    };

    fetchAdminData();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const showError = (errMsg) => {
    setError(errMsg);
    setTimeout(() => setError(''), 3000);
  };

  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;

      // Update profile info
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        contactNumber: adminData.contactNumber
      });

      // Handle password update if fields are filled
      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword) {
          showError('Please enter your old password.');
          return;
        }

        if (newPassword !== confirmPassword) {
          showError('New passwords do not match.');
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        await updatePassword(user, newPassword);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      showMessage('Account updated successfully.');
    } catch (err) {
      console.error('Update Error:', err);

      if (err.code === 'auth/wrong-password') {
        showError('The old password is incorrect. Please try again.');
      } else if (err.code === 'auth/invalid-credential') {
        showError('Old password does not match.');
      } else if (err.code === 'auth/too-many-requests') {
        showError('Too many requests. Please wait a few minutes and try again.');
      } else {
        showError('Error updating account. ' + err.message);
      }
    }
  };

  return (
    <>
      <AdminNav />
      {message && <p className="floating-message success">{message}</p>}
      {error && <p className="floating-message error">{error}</p>}

      <div className="manage-account-container">
        <h2>Manage Account</h2>

        <label>First Name</label>
        <input
          type="text"
          value={adminData.firstName}
          onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })}
        />

        <label>Last Name</label>
        <input
          type="text"
          value={adminData.lastName}
          onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
        />

        <label>Contact Number</label>
        <input
          type="text"
          value={adminData.contactNumber}
          onChange={(e) => setAdminData({ ...adminData, contactNumber: e.target.value })}
        />

        <label>Email</label>
        <input type="email" value={adminData.email} disabled />

        <h3 style={{ marginTop: '2rem' }}>Change Password (Optional)</h3>

        <label>Old Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleUpdate} className="manage-update">Update</button>
      </div>
    </>
  );
};

export default AdminAccount;
