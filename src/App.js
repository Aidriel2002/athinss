import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './pages/student/About';
import Login from './auth/Login';
import AdminHome from './pages/admin/AdminHome';
import AvailableExams from './pages/student/AvailableExams';
import StudentHome from './pages/student/StudentHome';
import ManageExams from './pages/admin/ManageExam';
import ManageUsers from './pages/admin/ManageUsers';
import ReviewResult from './pages/admin/ReviewResults';
import StartExam from './pages/student/StartExam';
import ManageExisting from './pages/admin/ManageExisting';
import ManageAccount from './pages/student/ManageAccount';
import ProtectedRoute from './components/ProtectedRoute';
import ReviewExam from './pages/admin/ReviewExam';
import RegisterStaff from './pages/admin/RegisterStaff';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />

        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-exams"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-existing"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageExisting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-exam"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReviewExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-result/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReviewResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Review-result"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReviewResult />
            </ProtectedRoute>
          }
        />
         <Route
          path="/register-staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RegisterStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-home"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AvailableExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-account"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ManageAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/start-exam/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StartExam />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
