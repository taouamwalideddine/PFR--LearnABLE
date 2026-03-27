import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BarChart3, TrendingUp, Clock, Award, Users, ChevronRight, AlertTriangle, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const CATEGORY_COLORS = {
    LANGAGE: '#6366f1',
    MATH: '#8b5cf6',
    EMOTIONS: '#ec4899',
    SOCIAL: '#14b8a6',
    VIE_QUOTIDIENNE: '#f59e0b',
    GENERAL: '#64748b',
};

const CATEGORY_LABELS = {
    LANGAGE: 'Language',
    MATH: 'Mathematics',
    EMOTIONS: 'Emotions',
    SOCIAL: 'Social Skills',
    VIE_QUOTIDIENNE: 'Daily Living',
    GENERAL: 'General',
};

const ClassroomDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState(null);
    const [childAnalytics, setChildAnalytics] = useState(null);
    const [loadingChild, setLoadingChild] = useState(false);

    useEffect(() => {
        fetchClassroom();
    }, []);

    const fetchClassroom = async () => {
        try {
            const res = await api.get('/analytics/classroom');
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchChildDetail = async (childId) => {
        setLoadingChild(true);
        try {
            const res = await api.get(`/analytics/child/${childId}`);
            setChildAnalytics(res.data);
            setSelectedChild(childId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingChild(false);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    if (loading) return (
        <div className="p-10 flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
    );

    // Aggregate totals for the header
    const totals = data.reduce((acc, d) => ({
        students: acc.students + 1,
        activities: acc.activities + d.stats.totalAttempted,
        completed: acc.completed + d.stats.totalCompleted,
        time: acc.time + d.stats.totalTimeSeconds,
    }), { students: 0, activities: 0, completed: 0, time: 0 });

    const avgSuccess = data.length > 0
        ? (data.reduce((sum, d) => sum + d.stats.avgSuccess, 0) / data.length)
        : 0;

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight flex items-center mb-4">
                    <BarChart3 className="w-12 h-12 mr-4 text-indigo-600" />
                    Classroom Dashboard
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-2xl">
                    Bird's-eye view of all your students' learning performance, progress trends, and category strengths.
                </p>
            </div>

            {/* Macro Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center mb-3">
                        <div className="p-2 bg-indigo-100 rounded-xl mr-3"><Users className="w-5 h-5 text-indigo-600" /></div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Students</span>
                    </div>
                    <p className="text-4xl font-extrabold text-slate-800">{totals.students}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center mb-3">
                        <div className="p-2 bg-purple-100 rounded-xl mr-3"><Award className="w-5 h-5 text-purple-600" /></div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                    </div>
                    <p className="text-4xl font-extrabold text-slate-800">{totals.completed}<span className="text-lg text-slate-400 ml-1">/ {totals.activities}</span></p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center mb-3">
                        <div className="p-2 bg-emerald-100 rounded-xl mr-3"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg. Success</span>
                    </div>
                    <p className="text-4xl font-extrabold text-slate-800">{avgSuccess.toFixed(0)}<span className="text-xl text-slate-400">%</span></p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center mb-3">
                        <div className="p-2 bg-amber-100 rounded-xl mr-3"><Clock className="w-5 h-5 text-amber-600" /></div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Time</span>
                    </div>
                    <p className="text-4xl font-extrabold text-slate-800">{formatTime(totals.time)}</p>
                </div>
            </div>

            {/* Student Roster */}
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-indigo-500" /> Student Roster
            </h2>

            {data.length === 0 ? (
                <div className="text-center py-20 bg-white shadow-sm border border-slate-100 rounded-3xl">
                    <AlertTriangle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">No Students Found</h3>
                    <p className="text-slate-500 font-medium">Add child profiles from the Children page to see data here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {data.map(item => {
                        const isSelected = selectedChild === item.child.id;
                        const successColor = item.stats.avgSuccess >= 70 ? 'text-emerald-600' : item.stats.avgSuccess >= 40 ? 'text-amber-600' : 'text-rose-600';
                        const successBg = item.stats.avgSuccess >= 70 ? 'bg-emerald-50' : item.stats.avgSuccess >= 40 ? 'bg-amber-50' : 'bg-rose-50';

                        return (
                            <div
                                key={item.child.id}
                                onClick={() => fetchChildDetail(item.child.id)}
                                className={`bg-white rounded-2xl shadow-lg border-2 p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${isSelected ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-100'}`}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center">
                                        <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg flex items-center justify-center text-2xl font-extrabold mr-4">
                                            {item.child.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-800">{item.child.name}</h3>
                                            <span className="text-sm font-bold text-slate-400">{item.child.age} years old</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl ${successBg}`}>
                                        <span className={`text-xl font-extrabold ${successColor}`}>{item.stats.avgSuccess.toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-5">
                                    <div className="text-center bg-slate-50 p-3 rounded-xl">
                                        <p className="text-2xl font-extrabold text-slate-800">{item.stats.totalCompleted}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Done</p>
                                    </div>
                                    <div className="text-center bg-slate-50 p-3 rounded-xl">
                                        <p className="text-2xl font-extrabold text-slate-800">{item.stats.totalAttempted}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Attempted</p>
                                    </div>
                                    <div className="text-center bg-slate-50 p-3 rounded-xl">
                                        <p className="text-2xl font-extrabold text-slate-800">{formatTime(item.stats.totalTimeSeconds)}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Time</p>
                                    </div>
                                </div>

                                {/* Mini category bars */}
                                <div className="flex gap-2 flex-wrap">
                                    {item.categoryBreakdown.map(cat => (
                                        <span
                                            key={cat.category}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg"
                                            style={{ backgroundColor: `${CATEGORY_COLORS[cat.category]}15`, color: CATEGORY_COLORS[cat.category] }}
                                        >
                                            {CATEGORY_LABELS[cat.category] || cat.category}: {cat.avgSuccess.toFixed(0)}%
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center justify-end text-sm font-bold text-indigo-500">
                                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Child Detail Panel */}
            {selectedChild && childAnalytics && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-12 animate-fade-in">
                    {loadingChild ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div></div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center">
                                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-extrabold mr-4">
                                        {childAnalytics.child.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-slate-800">{childAnalytics.child.name}'s Analytics</h2>
                                        <p className="text-slate-500 font-medium">Age {childAnalytics.child.age} · {childAnalytics.overall.totalCompleted} activities completed</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/analytics/report/${selectedChild}`)}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    Generate IEP Report
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Category Radar */}
                                <div className="bg-slate-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-extrabold text-slate-700 mb-4 flex items-center">
                                        <Star className="w-5 h-5 mr-2 text-indigo-500" /> Category Performance
                                    </h3>
                                    {childAnalytics.categoryBreakdown.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <RadarChart data={childAnalytics.categoryBreakdown.map(c => ({
                                                subject: CATEGORY_LABELS[c.category] || c.category,
                                                score: c.avgSuccess,
                                                fullMark: 100,
                                            }))}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                                <Radar name="Success" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-slate-400 font-medium text-center py-10">No data yet</p>
                                    )}
                                </div>

                                {/* Daily Trend */}
                                <div className="bg-slate-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-extrabold text-slate-700 mb-4 flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> 30-Day Activity Trend
                                    </h3>
                                    {childAnalytics.dailyTrend.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={childAnalytics.dailyTrend}>
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
                                                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 700 }}
                                                    labelFormatter={(v) => `Date: ${v}`}
                                                />
                                                <Bar dataKey="activitiesCount" name="Activities" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-slate-400 font-medium text-center py-10">No activity in the last 30 days</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Completed Lessons */}
                            {childAnalytics.recentLessons?.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-extrabold text-slate-700 mb-4">Recent Completions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {childAnalytics.recentLessons.map((lesson, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div>
                                                    <p className="font-bold text-slate-700">{lesson.lessonTitle}</p>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: `${CATEGORY_COLORS[lesson.lessonCategory]}15`, color: CATEGORY_COLORS[lesson.lessonCategory] }}>
                                                        {CATEGORY_LABELS[lesson.lessonCategory] || lesson.lessonCategory}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-extrabold text-indigo-600">{lesson.successRate?.toFixed(0)}%</p>
                                                    <p className="text-xs text-slate-400 font-medium">{new Date(lesson.completedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassroomDashboard;
