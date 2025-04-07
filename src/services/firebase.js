import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDri93DHUUYzJgj0N3lKWimCI5w_LR1Rm4",
  authDomain: "athens-db.firebaseapp.com",
  projectId: "athens-db",
  storageBucket: "athens-db.firebasestorage.app",
  messagingSenderId: "823309041696",
  appId: "1:823309041696:web:b112bbae9a4f8949613c45"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, googleProvider, db, storage };
