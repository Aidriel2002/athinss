import React, { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const role = userSnap.data().role;
          const isAuthorized = allowedRoles.includes(role);
          setAuthorized(isAuthorized);

          // Redirect if not authorized
          if (!isAuthorized) {
            // Go back if possible, otherwise go to home page
            navigate(-1, { replace: true });
          }
        } else {
          setAuthorized(false);
          navigate(-1, { replace: true });
        }
      } else {
        setAuthorized(false);
        navigate('/', { replace: true });
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [allowedRoles, navigate]);

  if (checking) return <p>Loading...</p>;

  return authorized ? children : null;
};

export default ProtectedRoute;
