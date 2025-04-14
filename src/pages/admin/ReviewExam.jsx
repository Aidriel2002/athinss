import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import './ReviewExam.css';
import AdminNav from '../../components/nav/AdminNav';

const ReviewExam = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openReview, setOpenReview] = useState(null);

  // Fetch onReview exams
  useEffect(() => {
    const fetchOnReviewExams = async () => {
      try {
        const reviewSnapshot = await getDocs(collection(db, 'onReview'));
        const reviewList = await Promise.all(
          reviewSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const examDoc = await getDoc(doc(db, 'exams', data.examId));
            const examData = examDoc.exists() ? examDoc.data() : {};
            const questions = examData.questions || [];
            const answers = data.answers || [];
            const essayScores = Array.isArray(data.essayScores)
              ? data.essayScores
              : new Array(questions.filter(q => q.type === 'essay').length).fill(0);

            return {
              id: docSnap.id,
              ...data,
              examName: examData.title || 'Untitled Exam', // Ensure examName is included
              questions,
              answers,
              essayScores,
            };
          })
        );

        setReviews(reviewList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    };

    fetchOnReviewExams();
  }, []);

  // Handle score change for essay questions
  const handleScoreChange = (e, review, qIndex, questionPoints) => {
    const inputValue = parseFloat(e.target.value);
    const clampedValue = Math.min(Math.max(0, inputValue), questionPoints);

    // Update the essayScores array for the specific review
    const updatedScores = [...review.essayScores];
    updatedScores[qIndex] = clampedValue;

    setReviews(reviews.map((r) =>
      r.id === review.id ? { ...r, essayScores: updatedScores } : r
    ));
  };

  // Handle approval (confirming the exam)
  const handleApprove = async (review) => {
    try {
      const { id, essayScores = [], score = 0, questions, ...rest } = review;

      // Clamp each essay score between 0 and its max points
      const validEssayScores = essayScores.map((rawScore, index) => {
        const maxPoints = questions[index]?.points || 0;
        const parsed = parseFloat(rawScore || 0);
        return Math.min(Math.max(0, parsed), maxPoints);
      });

      const totalEssayScore = validEssayScores.reduce((acc, s) => acc + s, 0);
      const totalScore = parseFloat(score || 0) + totalEssayScore;

      const dataToSave = {
        ...rest,
        score: totalScore,
        points: totalScore,
        essayScores: validEssayScores,
        essayStatus: 'graded',
      };

      await addDoc(collection(db, 'examResults'), dataToSave);
      await deleteDoc(doc(db, 'onReview', id));

      // Remove the reviewed exam from the state
      setReviews(reviews.filter((item) => item.id !== id));
      
      // Close the modal and notify the user
      setOpenReview(null);
      alert('Exam updated!');
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update exam. Please try again.');
    }
  };

  // Toggle the review details modal
  const toggleReviewDetails = (id) => {
    setOpenReview(openReview === id ? null : id);
  };

  return (
    <>
      <AdminNav />
      <div className="admin-review-exam-container">
        <h2>Essay Exams for Review</h2>
        {loading ? (
          <p>Loading submissions...</p>
        ) : reviews.length === 0 ? (
          <p>No exams pending review.</p>
        ) : (
          <div className="admin-review-exam-scrollable">
            {reviews.map((review, index) => (
              <div key={review.id} className="admin-review-exam-card">
                <h3
                  className="admin-review-exam-name"
                  onClick={() => toggleReviewDetails(review.id)}
                >
                  {index + 1}. {review.fullname}
                </h3>

                {openReview === review.id && (
                  <div className="admin-review-exam-modal">
                    <div className="admin-review-exam-modal-content">
                      <span
                        className="admin-review-exam-close"
                        onClick={() => setOpenReview(null)}
                      >
                        &times;
                      </span>

                      <h4><strong>Exam Name:</strong> {review.examName}</h4>
                      <p><strong>Score (Non-Essay):</strong> {review.score} / {review.totalPoints}</p>
                      <p><strong>Submitted on:</strong> {new Date(review.timestamp.toDate()).toLocaleString()}</p>

                      <div className="admin-review-exam-answers">
                        <h5>Answers:</h5>
                        {review.questions.map((question, qIndex) => {
                          const answer = review.answers?.[qIndex];
                          const questionType = question.type;

                          return (
                            <div key={qIndex} className="admin-review-exam-answer">
                              <p><strong>Question {qIndex + 1}: {question.question}</strong></p>

                              {questionType === 'essay' ? (
                                <>
                                  <textarea readOnly value={answer || ''} />
                                  <div className="admin-review-exam-score-input">
                                    <label>
                                      <strong>Essay Points ({question.points} pts):</strong>
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max={question.points}
                                      placeholder="Score for Essay"
                                      value={review.essayScores?.[qIndex] || 0} // Ensure value is correct
                                      onChange={(e) => handleScoreChange(e, review, qIndex, question.points)} // Update on change
                                    />
                                  </div>
                                </>
                              ) : questionType === 'multiple-choice' || questionType === 'identification' ? (
                                <p><strong>Answer:</strong> {answer}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        className="admin-review-exam-button"
                        onClick={() => handleApprove(review)} // Confirm button functionality
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ReviewExam;
