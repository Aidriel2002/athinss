import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNav from '../../components/nav/AdminNav';
import { handleLogout } from '../../auth/Logout';
import './ManageExam.css';
import { auth } from '../../services/firebase'; // Make sure to import auth

const ManageExams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [points, setPoints] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state

  // On Edit, populate the form with exam details and questions
  useEffect(() => {
    if (location.state?.exam) {
      const { title, description, questions, id } = location.state.exam;
      setTitle(title || '');
      setDescription(description || '');
      setQuestions(questions || []);
      setEditingId(id);
    }
  }, [location.state]);

  useEffect(() => {
    const checkAdminRole = async () => {
      const user = auth.currentUser;
      console.log("Current User:", user); // Log the current user
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          console.log("User Document:", userDoc.data()); // Log the user document data
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            console.log("Not an admin or user document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("No user authenticated.");
      }
      setLoading(false); // Set loading to false after checking role
    };

    checkAdminRole();
  }, []);

  if (loading) return <p>Loading...</p>; // Display loading message while checking user role
  if (!isAdmin) return <p>Access denied. Admins only.</p>;

  // Handle saving or updating the exam
  const handleAddOrUpdateExam = async () => {
    if (!title.trim()) {
      alert('Exam title is required.');
      return;
    }

    const examData = { title, description, questions };

    if (editingId) {
      const examDoc = doc(db, 'exams', editingId);
      await updateDoc(examDoc, examData);
    } else {
      await addDoc(collection(db, 'exams'), examData);
    }

    resetForm();
    navigate('/manage-existing');
  };

  // Handle adding or updating questions
  const handleAddOrUpdateQuestion = () => {
    if (!question || question.trim() === '') {
      alert("Please enter a valid question.");
      return;
    }

    if (points <= 0) {
      alert("Points must be greater than zero.");
      return;
    }

    const newQuestion = {
      question: question.trim(),
      type: questionType,
      points,
    };

    if (questionType === 'multiple-choice') {
      newQuestion.choices = (choices || []).filter(choice => choice?.trim() !== '');
      newQuestion.correctAnswer = correctAnswer;
    } else if (questionType === 'identification') {
      newQuestion.correctAnswer = correctAnswer;
    }

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuestions(updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
    }

    resetQuestionForm();
  };

  // Handle editing a question
  const handleEditQuestion = (index) => {
    const questionToEdit = questions[index];
    setQuestion(questionToEdit.question);
    setQuestionType(questionToEdit.type);
    setPoints(questionToEdit.points || 1);
    setChoices(questionToEdit.choices || ['', '', '', '']);
    setCorrectAnswer(questionToEdit.correctAnswer || '');
    setEditingQuestionIndex(index);
  };

  // Handle deleting a question
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Reset exam form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setQuestions([]);
    resetQuestionForm();
    setEditingId(null);
  };

  // Reset question form
  const resetQuestionForm = () => {
    setQuestion('');
    setChoices(['', '', '', '']);
    setCorrectAnswer('');
    setPoints(1);
    setEditingQuestionIndex(null);
  };

  return (
    <>
    <AdminNav handleLogout={() => handleLogout(navigate)} />
     
    <div className="manage-exams">
      {/* Left Section for Exam Creation/Editing */}
      <div className="exam-form-section">
        
        <div className="exam-form-container">
          <h1 className="exam-header">{editingId ? 'Edit Exam' : 'Create Exam'}</h1>
          <hr className="form-divider" />

          <div className="form-group">
            <input
              type="text"
              placeholder="Exam Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Exam Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <h2 className="question-header">Add Questions</h2>
          <div className="form-group">
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="input-field"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="identification">Identification</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Multiple Choice Section */}
          {questionType === 'multiple-choice' &&
            choices.map((choice, index) => (
              <div key={index} className="form-group">
                <input
                  type="text"
                  placeholder={`Choice ${index + 1}`}
                  value={choice}
                  onChange={(e) => {
                    const newChoices = [...choices];
                    newChoices[index] = e.target.value;
                    setChoices(newChoices);
                  }}
                  className="input-field"
                />
              </div>
            ))}

          {/* Correct Answer Selection */}
          {questionType === 'multiple-choice' && (
            <div className="radio-group">
              <h3>Select Correct Answer:</h3>
              {choices
                .filter((choice) => choice.trim() !== '')
                .map((choice, index) => (
                  <label key={index} className="radio-label">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={choice}
                      checked={correctAnswer === choice}
                      onChange={() => setCorrectAnswer(choice)}
                    />
                    {`${String.fromCharCode(65 + index)}. ${choice}`}
                  </label>
                ))}
            </div>
          )}

          {/* Identification Section */}
          {questionType === 'identification' && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Correct Answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {/* Points Section */}
          <div className="form-group">
            <label className="points-label">Set Points</label>
            <input
              type="number"
              placeholder="Points"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min="1"
              className="points-input"
            />
          </div>

          <button className="btn" onClick={handleAddOrUpdateQuestion}>
            {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
          </button>

          <button className="btn-submit" onClick={handleAddOrUpdateExam}>
            {editingId ? 'Update Exam' : 'Save Exam'}
          </button>
        </div>
      </div>

      <div className="question-list-section">
        <h2 className="question-list-header">Questions List</h2>
        <ul className="question-list">
          {questions.map((q, index) => (
            <li key={index} className="question-item">
              {q.question} ({q.points} pts)
              <button className="btn-edit" onClick={() => handleEditQuestion(index)}>Edit</button>
              <button className="btn-delete" onClick={() => handleDeleteQuestion(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
};

export default ManageExams;
