import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, GraduationCap, Trophy } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [childCount, setChildCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await api.get('/children');
                setChildCount(response.data.length);
            } catch (error) {
                console.error('Error fetching child count:', error);
            }
        };
        fetchCount();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Welcome back, {user?.email}
                </h1>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-blue-500">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">My Children</dt>
                                        <dd className="text-lg font-medium text-gray-900">{childCount} Profiles</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 text-sm">
                            <Link to="/children" className="text-blue-700 font-medium hover:text-blue-900">
                                View all profiles
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-green-500">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                    <GraduationCap className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Assigned Lessons</dt>
                                        <dd className="text-lg font-medium text-gray-900">0 Active</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 text-sm">
                            <span className="text-green-700 font-medium hover:text-green-900 cursor-pointer">
                                Manage lessons
                            </span>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-purple-500">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                    <Trophy className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Recent Progress</dt>
                                        <dd className="text-lg font-medium text-gray-900">No data yet</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 text-sm">
                            <Link to="/children" className="text-purple-700 font-medium hover:text-purple-900 cursor-pointer flex items-center">
                                Select child to view reports
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
