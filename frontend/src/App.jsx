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
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import ProgressDashboard from './pages/ProgressDashboard';
import EmotionsModule from './pages/EmotionsModule';
import StudentCourseMap from './pages/StudentCourseMap';
import RoutineList from './pages/RoutineList';
import RoutineDetail from './pages/RoutineDetail';
import ClassroomDashboard from './pages/ClassroomDashboard';
import IEPReport from './pages/IEPReport';
import AccessCodes from './pages/AccessCodes';
import MessagingPage from './pages/MessagingPage';
import MyStudents from './pages/MyStudents';
import CommunityForum from './pages/CommunityForum';
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
                            path="/my-students"
                            element={
                                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN']}>
                                    <MyStudents />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/curriculum"
                            element={
                                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN', 'PARENT']}>
                                    <CourseList />
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
                            path="/curriculum/:courseId"
                            element={
                                <ProtectedRoute roles={['EDUCATEUR', 'ADMIN', 'PARENT']}>
                                    <CourseDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/routines"
                            element={
                                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                                    <RoutineList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/routines/:id"
                            element={
                                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                                    <RoutineDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/classroom"
                            element={
                                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                                    <ClassroomDashboard />
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
                            path="/report/:childId"
                            element={
                                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                                    <IEPReport />
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
                        <Route
                            path="/map/:courseId"
                            element={
                                <ProtectedRoute>
                                    <StudentCourseMap />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/access"
                            element={
                                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                                    <AccessCodes />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/messages/:childId"
                            element={
                                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                                    <MessagingPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/forum"
                            element={
                                <ProtectedRoute roles={['PARENT', 'EDUCATEUR', 'ADMIN']}>
                                    <CommunityForum />
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
