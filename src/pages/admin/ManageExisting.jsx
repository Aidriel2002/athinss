import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ManageExisting.css';
import AdminNav from '../../components/nav/AdminNav';

const ManageExisting = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  const fetchExams = async () => {
    const examCollection = await getDocs(collection(db, 'exams'));
    setExams(examCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'exams', id));
    fetchExams(); // Refresh the list after deletion
  };

  const handleEdit = (exam) => {
    navigate('/manage-exams', { state: { exam } }); // Pass exam data to ManageExams page
  };

  return (
    <>
      <AdminNav />
      <div className="existing-exams">
        <h2 className="sub-header">Existing Exams</h2>
        <ul className="exam-list">
          {exams.map((exam) => (
            <li key={exam.id} className="exam-item">
              <h3>{exam.title}</h3>
              <p>{exam.description}</p>
              <p>Questions: {exam.questions.length}</p>
              <button className="btn-edit" onClick={() => handleEdit(exam)}>Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(exam.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ManageExisting;
