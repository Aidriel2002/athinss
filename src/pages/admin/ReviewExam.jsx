import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './ReviewExam.css'; // Optional: create this for custom styling
import AdminNav from '../../components/nav/AdminNav';

const ReviewExam = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openReview, setOpenReview] = useState(null); // Track which review is opened

  useEffect(() => {
    const fetchOnReviewExams = async () => {
      try {
        const reviewSnapshot = await getDocs(collection(db, 'onReview'));
        const reviewList = reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    };

    fetchOnReviewExams();
  }, []);

  const handleApprove = async (review) => {
    try {
      const { id, ...data } = review;
      await addDoc(collection(db, 'examResults'), {
        ...data,
        essayStatus: 'graded',
      });

      await deleteDoc(doc(db, 'onReview', id));
      setReviews(reviews.filter((item) => item.id !== id));
      alert('Exam approved and moved to examResults!');
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  // Toggle the visibility of a review's details (modal)
  const toggleReviewDetails = (id) => {
    setOpenReview(openReview === id ? null : id); // Close if it's already open
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
                  {index + 1}. {review.email}
                </h3>

                {/* Show modal with review details if the review is open */}
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
                        <h5>Essay & Answers:</h5>
                        {Object.entries(review.answers).map(([qIndex, answer]) => (
                          <div key={qIndex} className="admin-review-exam-answer">
                            <p><strong>Question {parseInt(qIndex) + 1}:</strong></p>
                            <textarea readOnly value={answer} />
                          </div>
                        ))}
                      </div>

                      <div>
                        <input
                          type="number"
                          min="0"
                          max={review.maxEssayPoints}
                          placeholder="Score for Essay"
                          onChange={(e) => setReviews(reviews.map(r => r.id === review.id ? { ...r, essayScore: e.target.value } : r))}
                        />
                      </div>

                      <button
                        className="admin-review-exam-button"
                        onClick={() => handleApprove(review)}
                      >
                        Approve & Move to Results
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
