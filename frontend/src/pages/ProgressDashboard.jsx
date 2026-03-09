import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Target, Award, ArrowLeft } from 'lucide-react';

const ProgressDashboard = () => {
    const { childId } = useParams();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgressData();
    }, [childId]);

    const fetchProgressData = async () => {
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.get(`/progress/stats/${childId}`),
                api.get(`/progress/child/${childId}`)
            ]);
            setStats(statsRes.data);

            // Format history for chart
            const formattedHistory = historyRes.data.map(item => ({
                date: new Date(item.timestamp).toLocaleDateString(),
                successRate: item.successRate,
                name: item.activity.title
            })).reverse(); // Oldest first for chart

            setHistory(formattedHistory);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) return <div className="p-8 text-center text-gray-500">Loading comprehensive progress data...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <Link to="/children" className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Profiles
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Progress Analytics</h1>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Stat Cards */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 ring-1 ring-blue-50">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Activities</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{stats.totalActivitiesCompleted}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 ring-1 ring-green-50">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <Target className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Success Rate</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{Math.round(stats.averageSuccessRate)}%</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 ring-1 ring-purple-50">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Learning Time</dt>
                                    <dd className="text-2xl font-bold text-gray-900">{Math.round(stats.totalTimeSpentSeconds / 60)} min</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 ring-1 ring-yellow-50">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                                <Award className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Rewards Earned</dt>
                                    <dd className="text-2xl font-bold text-gray-900">0</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Success Rate Over Time</h2>
                    <div className="h-80 w-full">
                        {history.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={history}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="successRate"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSuccess)"
                                        name="Success Score"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                Not enough data to display chart.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressDashboard;
