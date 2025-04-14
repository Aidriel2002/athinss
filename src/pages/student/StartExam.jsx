import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../services/firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './StartExam.css';
import StudentNav from '../../components/nav/StudentNav';

const StartExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [examTitle, setExamTitle] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [examTaken, setExamTaken] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [userStatus, setUserStatus] = useState('pending');
  const [isFinalized, setIsFinalized] = useState(false);
  const [fullname, setFullname] = useState('');

  useEffect(() => {
    const fetchUserProfile = async (userId) => {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        setFullname(name);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        setUid(user.uid);
        fetchUserProfile(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (email) {
        const userQuery = query(
          collection(db, 'examUsers'),
          where('email', '==', email),
          where('examId', '==', id)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUserStatus(userData.status);
        } else {
          setUserStatus('pending');
        }
      }
    };

    checkUserStatus();
  }, [email, id]);

  useEffect(() => {
    const fetchExam = async () => {
      const examRef = doc(db, 'exams', id);
      const examSnap = await getDoc(examRef);

      if (examSnap.exists()) {
        const data = examSnap.data();
        setExam(data);
        setExamTitle(data.title || 'Untitled Exam');
      } else {
        console.log('No such exam found!');
        setExam({});
        setExamTitle('Exam Not Found');
      }
    };

    fetchExam();
  }, [id]);

  useEffect(() => {
    const checkIfTaken = async () => {
      if (email && userStatus === 'approved') {
        const resultQuery = query(
          collection(db, 'examResults'),
          where('email', '==', email),
          where('examId', '==', id)
        );
        const resultSnapshot = await getDocs(resultQuery);

        const onReviewQuery = query(
          collection(db, 'onReview'),
          where('email', '==', email),
          where('examId', '==', id)
        );
        const onReviewSnapshot = await getDocs(onReviewQuery);

        if (!resultSnapshot.empty || !onReviewSnapshot.empty) {
          const isReviewed = !resultSnapshot.empty;
          const data = isReviewed
            ? resultSnapshot.docs[0].data()
            : onReviewSnapshot.docs[0].data();

          setScore(data.score || 0);
          setTotalPoints(data.totalPoints || 0);
          setAnswers(data.answers || {});
          setSubmitted(true);
          setExamTaken(true);
          setReviewMode(true);
          setIsFinalized(isReviewed);
        } else {
          setExamTaken(false);
        }
      }
    };

    checkIfTaken();
  }, [id, email, userStatus]);

  const handleSubmit = async () => {
    if (examTaken) {
      alert('You have already taken this exam. You can only review it.');
      return;
    }

    let nonEssayScore = 0;
    let calculatedTotalPoints = 0;
    let hasEssay = false;
    
    // Loop through all questions to calculate total points and score
    exam?.questions?.forEach((q, index) => {
      const points = q.points || 1;
      
      // Always add points to the total points
      calculatedTotalPoints += points;
    
      const userAnswer = answers[index]?.toLowerCase?.() || '';
      const correctAnswer = q.correctAnswer?.toLowerCase?.() || '';
    
      // If the question is an essay, set flag
      if (q.type === 'essay') {
        hasEssay = true;
      } else if (userAnswer !== '' && userAnswer === correctAnswer) {
        // For non-essay questions, award points if the answer is correct
        nonEssayScore += points;
      }
    });
    
    setScore(nonEssayScore); // Only set score for non-essay correct answers
    setTotalPoints(calculatedTotalPoints); // Set total points for all questions
    
    const resultData = {
      uid,
      email,
      fullname,
      examId: id,
      score: nonEssayScore,
      essayStatus: hasEssay ? 'on-review' : 'none',
      totalPoints: calculatedTotalPoints,
      answers,
      timestamp: new Date(),
      retakeStatus: false,
    };

    const collectionName = hasEssay ? 'onReview' : 'examResults';

    const resultQuery = query(
      collection(db, collectionName),
      where('email', '==', email),
      where('examId', '==', id)
    );
    const resultSnapshot = await getDocs(resultQuery);

    if (!resultSnapshot.empty) {
      const resultDocId = resultSnapshot.docs[0].id;
      const resultDocRef = doc(db, collectionName, resultDocId);
      await updateDoc(resultDocRef, resultData);
      alert(`Your exam has been ${hasEssay ? 'submitted for review' : 'submitted'} and updated!`);
    } else {
      await addDoc(collection(db, collectionName), resultData);
      alert(`Exam ${hasEssay ? 'submitted for review' : 'submitted'} successfully!`);
    }

    setReviewMode(true);
    navigate('/exams');
  };

  const handleBackToExams = () => {
    navigate('/exams');
  };

  if (userStatus === 'pending') {
    return (
      <div className="student-start-exam-container">
        <p className="student-start-exam-warning-text">
          Your request is pending. Please wait for admin approval.
        </p>
      </div>
    );
  }

  if (userStatus === 'declined') {
    return (
      <div className="student-start-exam-container">
        <p className="student-start-exam-error-text">Your request was declined. You cannot take the exam.</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="student-start-exam-container">
        <h3>Loading Exam...</h3>
      </div>
    );
  }

  return (
    <>
    <StudentNav />
 
    <div className="student-start-exam-container">
      <h2 className="student-start-exam-title">{examTitle}</h2>
      <p className="student-start-exam-subtitle">{exam.description}</p>
      <div className="student-start-exam-divider"></div>

      {examTaken && reviewMode ? (
        <div className="student-start-exam-info-text">
          <h3>You have already taken this exam. You can review your answers below.</h3>
        </div>
      ) : (
        <div>
          {Array.isArray(exam.questions) && exam.questions.length > 0 ? (
            exam.questions.map((question, index) => (
              <div key={index} className="student-start-exam-question-container">
                <h4 className="student-start-exam-question-text">
                  {index + 1}. {question.question}
                </h4>
                {question.type === 'multiple-choice' ? (
                  <div className="student-start-exam-radio-group">
                    {question.choices?.map((choice, choiceIndex) => (
                      <label key={choiceIndex} className="student-start-exam-radio-option">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={choice}
                          checked={answers[index] === choice}
                          onChange={(e) =>
                            setAnswers({ ...answers, [index]: e.target.value })
                          }
                          disabled={examTaken}
                        />
                        {choice}
                      </label>
                    ))}
                  </div>
                ) : question.type === 'essay' ? (
                  <div className="student-start-exam-essay-container">
                    <textarea
                      value={answers[index] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [index]: e.target.value })
                      }
                      disabled={examTaken}
                      placeholder="Write your essay answer here..."
                    />
                  </div>
                ) : question.type === 'identification' ? (
                  <div className="student-start-exam-identification-container">
                    <input
                      type="text"
                      value={answers[index] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [index]: e.target.value })
                      }
                      disabled={examTaken}
                      placeholder="Type your answer here..."
                    />
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div>No questions available for this exam.</div>
          )}
        </div>
      )}

      {submitted ? (
        <div>
          <h3>
            {exam?.questions.some((q) => q.type === 'essay') && !isFinalized ? (
              <>Partial Score: {score} / {totalPoints}</>
            ) : (
              <>Your Final Score: {score} / {totalPoints}</>
            )}
          </h3>
          <button className="student-start-exam-button student-start-exam-button-secondary" onClick={handleBackToExams}>
            Back to Exams
          </button>
        </div>
      ) : (
        <button
          className="student-start-exam-button student-start-exam-button-success"
          onClick={handleSubmit}
          disabled={examTaken}
        >
          Submit Exam
        </button>
      )}
    </div>
    </>
  );
};

export default StartExam;
