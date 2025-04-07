import { auth } from '../services/firebase';

/**
 * @param {Function} navigate
 */
export const handleLogout = async (navigate) => {
  try {
    await auth.signOut();
    navigate('/');
  } catch (error) {
    console.error("Logout failed", error);
  }
};
