import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChildProfiles from './pages/ChildProfiles';
import LessonList from './pages/LessonList';
import LessonForm from './pages/LessonForm';
import LessonDetail from './pages/LessonDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/children"
              element={
                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                  <ChildProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons"
              element={
                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN']}>
                  <LessonList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/new"
              element={
                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN']}>
                  <LessonForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN', 'PARENT']}>
                  <LessonDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
