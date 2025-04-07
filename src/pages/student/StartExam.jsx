import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../services/firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './StartExam.css';

const StartExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [examTaken, setExamTaken] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [userStatus, setUserStatus] = useState('pending');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        setUid(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkIfTaken = async () => {
      if (email && userStatus === 'approved') {
        const resultQuery = query(
          collection(db, 'examResults'),
          where('email', '==', email),
          where('examId', '==', id)
        );
        const resultSnapshot = await getDocs(resultQuery);

        if (!resultSnapshot.empty) {
          const resultData = resultSnapshot.docs[0].data();
          if (resultData && resultData.score !== undefined) {
            setScore(resultData.score);
            setTotalPoints(resultData.totalPoints || 0);
            setAnswers(resultData.answers || {});
            setSubmitted(true);
            setExamTaken(true);
            setReviewMode(true);
          } else {
            setExamTaken(false);
          }
        } else {
          setExamTaken(false);
        }
      }
    };

    checkIfTaken();
  }, [id, email, userStatus]);

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
      const examDoc = await getDoc(doc(db, 'exams', id));
      if (examDoc.exists()) {
        const examData = examDoc.data();
        if (examData.questions && Array.isArray(examData.questions)) {
          setExam(examData);
        } else {
          console.log('No valid questions found.');
          setExam({});
        }
      } else {
        console.log('No such exam!');
        setExam({});
      }
    };

    fetchExam();
  }, [id]);

  const handleSubmit = async () => {
    if (examTaken) {
      alert('You have already taken this exam. You can only review it.');
      return;
    }

    let totalScore = 0;
    let calculatedTotalPoints = 0;
    let nonEssayScore = 0;
    let hasEssay = false;

    exam?.questions?.forEach((q, index) => {
      const points = q.points || 1;
      calculatedTotalPoints += points;

      const userAnswer = answers[index]?.toLowerCase?.() || '';
      const correctAnswer = q.correctAnswer?.toLowerCase?.() || '';

      if (q.type === 'essay') {
        hasEssay = true;
      } else {
        if (userAnswer === correctAnswer) {
          nonEssayScore += points;
        }
      }
    });

    setScore(nonEssayScore);
    setTotalPoints(calculatedTotalPoints);
    setSubmitted(true);

    const resultData = {
      uid, // 🔒 required for Firestore rule
      email,
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
    <div className="student-start-exam-container">
      <h2 className="student-start-exam-title">{exam.title}</h2>
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
                    {Array.isArray(question.choices) &&
                      question.choices.map((choice, choiceIndex) => (
                        <label key={choiceIndex} className="student-start-exam-radio-option">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={choice}
                            checked={answers[index] === choice}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [index]: e.target.value,
                              })
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
                        setAnswers({
                          ...answers,
                          [index]: e.target.value,
                        })
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
                        setAnswers({
                          ...answers,
                          [index]: e.target.value,
                        })
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
            {exam?.questions.some((q) => q.type === 'essay') ? (
              <span>
                Partial Score: {score} / {totalPoints}
              </span>
            ) : (
              <span>
                Your Score: {score} / {totalPoints}
              </span>
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
  );
};

export default StartExam;
