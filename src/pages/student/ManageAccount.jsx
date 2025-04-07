import React, { useState, useEffect } from 'react';
import { auth, db } from '../../services/firebase';
import {
  updateEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import './ManageAccount.css';
import StudentNav from '../../components/nav/StudentNav';

const ManageAccount = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setEmail(currentUser.email || '');

      const fetchProfileData = async () => {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setContactNumber(data.contactNumber || '');
          setProfilePicture(data.profilePicture || '');
        }
      };

      fetchProfileData();
    }
  }, []);

  const compressImage = (file, maxWidth = 300, maxHeight = 300) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setProfilePicture(compressed);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        if (email !== currentUser.email) {
          await updateEmail(currentUser, email);
        }

        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          firstName,
          lastName,
          email,
          contactNumber,
          profilePicture,
          name: `${firstName} ${lastName}` // Optional if you still want a combined field
        });

        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile: ', error);
      alert('Error updating profile');
    }
    setIsLoading(false);
  };

  return (
    <>
      <StudentNav />
      <div className='manage-account-container'>
        <h2>Manage Account</h2>

        {profilePicture && (
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <img
              src={profilePicture}
              alt="Profile Preview"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          </div>
        )}

        {user ? (
          <div>
            <div>
              <label>First Name:</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label>Last Name:</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label>Contact Number:</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled // Disable the email input field
              />
            </div>

            <div>
              <label>Profile Picture:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <button onClick={handleUpdateProfile} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        ) : (
          <p>Loading user...</p>
        )}
      </div>
    </>
  );
};

export default ManageAccount;
