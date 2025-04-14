import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../../components/nav/AdminNav';
import { handleLogout } from '../../auth/Logout';
import './ReviewResults.css';

const ReviewResult = () => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resultSnapshot = await getDocs(collection(db, 'examResults'));
        const resultList = await Promise.all(
          resultSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const examRef = doc(db, 'exams', data.examId);
            const examSnap = await getDoc(examRef);
            const examData = examSnap.exists() ? examSnap.data() : null;
            return {
              id: docSnap.id,
              ...data,
              exam: examData,
            };
          })
        );
        setResults(resultList);
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    fetchResults();
  }, []);

  const handleViewDetails = async (result) => {
    setSelectedResult(result);

    try {
      const examDoc = await getDoc(doc(db, 'exams', result.examId));
      if (examDoc.exists()) {
        setExamDetails(examDoc.data());
      } else {
        setExamDetails(null);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
      setExamDetails(null);
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedResult(null);
    setExamDetails(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'examResults', id));
      setResults(results.filter((result) => result.id !== id));
      alert('Result deleted successfully!');
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const getAnswerColor = (index, selectedAnswer, correctAnswer) => {
    if (
      selectedAnswer === undefined ||
      selectedAnswer === null ||
      selectedAnswer === ''
    ) {
      return 'gray'; // For unanswered questions
    }
    if (correctAnswer === undefined || correctAnswer === null) {
      return 'gray'; // If there's no correct answer
    }
    return selectedAnswer.toLowerCase() === correctAnswer.toLowerCase()
      ? 'green'
      : 'red'; // Correct or Incorrect
  };

  return (
    <div className="review-results">
      <AdminNav handleLogout={() => handleLogout(navigate)} />
      <div className="header">
        <h1 className="title">Review Exam Results</h1>
        <div className="divider"></div>
      </div>

      <ul className="results-list">
        {results.map((result) => {
          const score = Number(result.score);
          const totalPoints = Number(result.totalPoints);
          const passThreshold = result.exam?.passThreshold ?? 70;
          const status = (score / totalPoints) * 100 >= passThreshold ? 'Passed' : 'Failed';
          const statusClass = status === 'Passed' ? 'passed' : 'failed';

          return (
            <li key={result.id} className={`result-item ${statusClass}`}>
              <div className="result-info">
                <span>Email: {result.email}</span>
                <span>Score: {score}/{totalPoints}</span>
                <span><strong>Status: {status}</strong></span>
              </div>
              <div className="result-actions">
                <button className="view-btn" onClick={() => handleViewDetails(result)}>
                  View Details
                </button>
                <button className="delete-btn" onClick={() => handleDelete(result.id)}>
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {open && (
        <div className="dialog">
          <div className="dialog-content">
            <h3>Exam Result Details</h3>
            {selectedResult && (
              <>
                <p><strong>Email:</strong> {selectedResult.email}</p>
                <p><strong>Score:</strong> {selectedResult.score}/{selectedResult.totalPoints}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  {(selectedResult.score / selectedResult.totalPoints) * 100 >= (examDetails?.passThreshold ?? 70)
                    ? 'Passed'
                    : 'Failed'}
                </p>

                {examDetails ? (
                  <div className="exam-details">
                    <h4>Exam Title: {examDetails.title}</h4>
                    <p>Description: {examDetails.description}</p>

                    <h4>Student Answers:</h4>
                    <ul>
                      {examDetails.questions.map((question, index) => {
                        const selectedAnswer = selectedResult.answers[index];
                        const correctAnswer = question.correctAnswer;
                        const answerColor = getAnswerColor(
                          index,
                          selectedAnswer,
                          correctAnswer
                        );

                        return (
                          <li key={index}>
                            <p><strong style={{ color: answerColor }}>Q{index + 1}: {question.question}</strong></p>
                            <p>Student's Answer: <span style={{ color: answerColor }}>{selectedAnswer || 'Not Answered'}</span></p>
                            <p>Correct Answer: <span style={{ color: 'green' }}>{correctAnswer}</span></p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <p>No exam details available.</p>
                )}
              </>
            )}
            <button className="close-btn" onClick={handleClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewResult;
