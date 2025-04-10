import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './AvailableExams.css';
import StudentNav from '../../components/nav/StudentNav';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [takenExams, setTakenExams] = useState([]);
  const [approvedExams, setApprovedExams] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [examRequests, setExamRequests] = useState({}); // Track request status for each exam
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchExams = async () => {
      const examCollection = await getDocs(collection(db, 'exams'));
      const examList = examCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExams(examList);

      if (currentUser) {
        // Fetch approved exams
        const resultsQuery = query(
          collection(db, 'examUsers'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'approved')
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        const approvedExamIds = resultsSnapshot.docs.map((doc) => doc.data().examId);
        setApprovedExams(approvedExamIds);

        // Fetch taken exams
        const takenExamsQuery = query(
          collection(db, 'examResults'),
          where('userId', '==', currentUser.uid)
        );
        const takenExamsSnapshot = await getDocs(takenExamsQuery);
        const takenExamIds = takenExamsSnapshot.docs.map((doc) => doc.data().examId);
        setTakenExams(takenExamIds);
      }
    };

    fetchExams();
  }, [currentUser]);

  const isExamApproved = (examId) => approvedExams.includes(examId);
  const isExamTaken = (examId) => takenExams.includes(examId);

  const handleRequestExam = async (examId) => {
    if (!currentUser || examRequests[examId]) return;  // Prevent re-requests for the same exam
  
    // Mark exam as requested to prevent further clicks
    setExamRequests((prevState) => ({
      ...prevState,
      [examId]: true,
    }));
  
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const firstName = userData?.firstName;
    const lastName = userData?.lastName;
    let profilePicture = userData?.profilePicture; // Fetch the profile picture URL
  
    // Use a default image if profilePic is undefined
    if (!profilePicture) {
      profilePicture = ''; // Or provide a default image URL if available
    }
  
    // Check if first name and last name are missing
    if (!firstName || !lastName) {
      setErrorMessage('Please add your name first before starting the exam.');
      setTimeout(() => {
        navigate('/manage-account');  // Redirect to Manage Account page
      }, 3000);  // Redirect after 3 seconds
      setExamRequests((prevState) => ({
        ...prevState,
        [examId]: false, // Reset the request state after redirect
      }));
      return;
    }
  
    if (isExamApproved(examId)) {
      alert('You are already approved for this exam.');
      setExamRequests((prevState) => ({
        ...prevState,
        [examId]: false, // Reset the request state
      }));
      return;
    }
  
    // Check if the student has already requested this exam
    const existingRequestQuery = query(
      collection(db, 'examUsers'),
      where('userId', '==', currentUser.uid),
      where('examId', '==', examId),
      where('status', '==', 'pending')
    );
    const existingRequestSnapshot = await getDocs(existingRequestQuery);
    if (!existingRequestSnapshot.empty) {
      alert('You have already requested this exam. Please wait for approval.');
      setExamRequests((prevState) => ({
        ...prevState,
        [examId]: false, // Reset the request state
      }));
      return;
    }
  
    const contactNumber = userData?.contactNumber || 'N/A';
  
    try {
      await addDoc(collection(db, 'examUsers'), {
        userId: currentUser.uid,
        examId: examId,
        status: 'pending',
        createdAt: new Date(),
        firstName: firstName,
        lastName: lastName,  // Ensure last name is included
        email: currentUser.email,
        contactNumber: contactNumber,
        profilePicture: profilePicture, // Include profile picture URL or default
      });
  
      alert('You have requested this exam. Please wait for approval.');
    } catch (error) {
      console.error('Error requesting exam: ', error);
      alert('There was an issue with your request. Please try again.');
    } finally {
      setExamRequests((prevState) => ({
        ...prevState,
        [examId]: false, // Reset the request state after the request is processed
      }));
    }
  };
  

  const handleStartExam = async (examId) => {
    if (!currentUser) return;

    if (!isExamApproved(examId)) {
      handleRequestExam(examId);
      return;
    }

    if (!isExamTaken(examId)) {
      navigate(`/start-exam/${examId}`);
    } else {
      navigate(`/review-exam/${examId}`);
    }
  };

  return (
    <div className="page-container">
      <StudentNav className="student-nav" />
      <div className="student-available-exam-container">
        <h2 className="student-available-exam-title">Available Exams</h2>

        {errorMessage && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</p>
        )}

        <ul className="student-exam-list">
          {exams.map((exam) => (
            <li key={exam.id} className="student-exam-item">
              <div className="student-exam-details">
                <h3 className="student-exam-title">{exam.title}</h3>
                <p className="student-exam-description">{exam.description}</p>
              </div>
              <div className="student-exam-action">
                <button
                  className="student-exam-button"
                  onClick={() => handleStartExam(exam.id)}
                  disabled={examRequests[exam.id] || isExamTaken(exam.id)}
                >
                  {isExamTaken(exam.id)
                    ? 'Review'
                    : isExamApproved(exam.id)
                    ? 'Start'
                    : 'Request'}
                </button>
              </div>
              <hr className="student-exam-divider" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AvailableExams;
