import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import ChildProfiles from './pages/ChildProfiles';
import LessonList from './pages/LessonList';
import LessonForm from './pages/LessonForm';
import LessonDetail from './pages/LessonDetail';
import ProgressDashboard from './pages/ProgressDashboard';
import EmotionsModule from './pages/EmotionsModule';
import Sidebar from './components/Sidebar';

// A component to intelligently route between dashboards based on activeChild
const DashboardRouter = () => {
    const { activeChild } = useAuth();
    if (activeChild) {
        return <StudentDashboard />;
    }
    return <Dashboard />;
};

function AppContent() {
    const { activeChild } = useAuth();

    return (
        <Router>
            <div className="flex bg-slate-50 min-h-screen">
                <Sidebar />
                
                {/* Main Content Wrapper - Adds left margin on desktop to accommodate sidebar ONLY if not in student mode */}
                <div className={`flex-1 min-h-screen transition-all duration-300 relative ${activeChild ? '' : 'md:ml-72'}`}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardRouter />
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
                                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN', 'PARENT']}>
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
                        <Route
                            path="/progress/:childId"
                            element={
                                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN', 'PARENT']}>
                                    <ProgressDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/emotions"
                            element={
                                <ProtectedRoute>
                                    <EmotionsModule />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
