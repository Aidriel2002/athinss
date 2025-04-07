import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/nav/AdminNav';
import { handleLogout } from '../../auth/Logout';
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [examTitles, setExamTitles] = useState({});
  const [selectedExam, setSelectedExam] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      const examsCollection = collection(db, 'exams');
      const examsSnapshot = await getDocs(examsCollection);
      const examsMap = {};
      examsSnapshot.docs.forEach((doc) => {
        examsMap[doc.id] = doc.data().title;
      });
      setExamTitles(examsMap);
    };

    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExam) return;

    const fetchUsers = async () => {
      const usersCollection = collection(db, 'examUsers');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.examId === selectedExam);

      usersList.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });

      setUsers(usersList);
    };

    fetchUsers();
  }, [selectedExam]);

  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / rowsPerPage);

  const handleApprove = async (userId) => {
    const userRef = doc(db, 'examUsers', userId);
    await updateDoc(userRef, { status: 'approved' });
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: 'approved' } : user)));
  };

  const handleDecline = async (userId) => {
    const userRef = doc(db, 'examUsers', userId);
    await updateDoc(userRef, { status: 'declined' });
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: 'declined' } : user)));
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const userRef = doc(db, 'examUsers', userId);
      await deleteDoc(userRef);
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  return (
    <div className="manage-users">
      <AdminSidebar handleLogout={() => handleLogout(navigate)} />
      <div className="manage-users__content">
        <h1 className="manage-users__header">Manage User Accounts</h1>
        <div className="manage-users__divider"></div>

        <div className="manage-users__exam-selection">
          <label>Select Exam:</label>
          <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
            <option value="">-- Select an Exam --</option>
            {Object.entries(examTitles).map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </div>

        {!selectedExam ? (
          <p className="manage-users__no-users">Please select an exam to view users.</p>
        ) : users.length === 0 ? (
          <p className="manage-users__no-users">No users found for this exam.</p>
        ) : (
          <div className="manage-users__table-container">
            <table className="manage-users__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.firstName}</td>
                    <td>{user.email}</td>
                    <td>{user.contactNumber}</td>
                    <td>
                      <span className={`manage-users__status-chip ${user.status || 'pending'}`}>
                        {user.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <div className="manage-users__action-buttons">
                        {user.status === 'pending' && (
                          <>
                            <button
                              className="manage-users__button manage-users__button--approve"
                              onClick={() => handleApprove(user.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="manage-users__button manage-users__button--decline"
                              onClick={() => handleDecline(user.id)}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <button
                          className="manage-users__button manage-users__button--delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="manage-users__pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="manage-users__pagination-button"
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="manage-users__pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
