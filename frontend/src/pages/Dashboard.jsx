import React from 'react';
import { useAuth } from '../context/AuthContext';
import ParentDashboard from './ParentDashboard';
import EducatorDashboard from './EducatorDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'EDUCATEUR') {
        return <EducatorDashboard />;
    }

    // PARENT, ADMIN, or fallback
    return <ParentDashboard />;
};

export default Dashboard;
