import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Users, GraduationCap, BarChart3, Calendar, Shield, MessageSquare, BookOpen,
    ArrowRight, TrendingUp, Clock, Target, ChevronRight, Sparkles, FileText, Activity
} from 'lucide-react';

const EducatorDashboard = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [classStats, setClassStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [studRes, classRes] = await Promise.all([
                api.get('/access-codes/my-students'),
                api.get('/progress/classroom'),
            ]);
            setStudents(studRes.data);
            setClassStats(classRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const totalStudents = students.length;
    const avgSuccess = classStats.length
        ? Math.round(classStats.reduce((s, c) => s + c.avgSuccess, 0) / classStats.length)
        : 0;
    const totalCompleted = classStats.reduce((s, c) => s + c.totalCompleted, 0);
    const totalTime = Math.round(classStats.reduce((s, c) => s + c.totalTimeSeconds, 0) / 60);

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    const firstName = user?.email?.split('@')[0] || 'Educator';

    // Sort students by those needing attention (lowest avg success first)
    const studentsWithStats = students.map(s => {
        const stat = classStats.find(c => c.childId === s.childId);
        return { ...s, avgSuccess: stat?.avgSuccess || 0, totalCompleted: stat?.totalCompleted || 0 };
    }).sort((a, b) => a.avgSuccess - b.avgSuccess);

    const needsAttention = studentsWithStats.filter(s => s.avgSuccess < 60 && s.totalCompleted > 0);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-10 min-h-screen">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 lg:p-10 mb-8 overflow-hidden shadow-2xl shadow-emerald-200">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-16 -mb-16 blur-xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Educator Dashboard</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
                        Welcome back, {firstName}! 🎓
                    </h1>
                    <p className="text-lg text-white/70 font-medium max-w-xl">
                        {totalStudents} student{totalStudents !== 1 ? 's' : ''} linked. Track progress, generate reports, and build personalized curricula.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-emerald-100 p-2.5 rounded-xl"><Users className="w-5 h-5 text-emerald-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{totalStudents}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Students</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 p-2.5 rounded-xl"><Target className="w-5 h-5 text-indigo-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{avgSuccess}%</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Class Avg</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-amber-100 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{totalCompleted}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2.5 rounded-xl"><Clock className="w-5 h-5 text-purple-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{totalTime} min</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Total Time</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Students List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Needs Attention */}
                    {needsAttention.length > 0 && (
                        <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                            <h2 className="text-lg font-extrabold text-rose-800 mb-3 flex items-center gap-2">
                                ⚠️ Needs Attention
                            </h2>
                            <div className="space-y-2">
                                {needsAttention.map(s => (
                                    <Link to={`/progress/${s.childId}`} key={s.linkId} className="flex items-center gap-4 p-3 rounded-xl bg-white hover:bg-rose-50/50 transition">
                                        <div className="h-10 w-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-extrabold shadow">
                                            {s.childName?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm">{s.childName}</p>
                                            <p className="text-xs text-slate-400">{Math.round(s.avgSuccess)}% avg success</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Students */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-500" /> My Students
                            </h2>
                            <Link to="/my-students" className="text-sm font-bold text-emerald-500 hover:text-emerald-700 flex items-center gap-1 transition">
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {students.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium mb-3">No students linked yet.</p>
                                <Link to="/access" className="text-emerald-600 font-bold text-sm hover:underline">Redeem an access code →</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {studentsWithStats.slice(0, 6).map(s => {
                                    const success = Math.round(s.avgSuccess);
                                    const barColor = success >= 80 ? 'bg-emerald-500' : success >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                                    return (
                                        <Link to={`/progress/${s.childId}`} key={s.linkId} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 transition group">
                                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                                                {s.childName?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-extrabold text-slate-800 truncate">{s.childName}</p>
                                                <p className="text-xs font-medium text-slate-400">{s.childAge} yrs · {s.totalCompleted} activities done</p>
                                            </div>
                                            <div className="w-24 hidden sm:block">
                                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                                    <span>Score</span><span>{success}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${success}%` }}></div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-extrabold text-slate-800 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link to="/my-students" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition font-bold text-sm">
                                <Users className="w-5 h-5" /> My Students
                            </Link>
                            <Link to="/curriculum" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition font-bold text-sm">
                                <GraduationCap className="w-5 h-5" /> Build Curriculum
                            </Link>
                            <Link to="/classroom" className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-bold text-sm">
                                <BarChart3 className="w-5 h-5" /> Classroom Insights
                            </Link>
                            <Link to="/routines" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-bold text-sm">
                                <Calendar className="w-5 h-5" /> Manage Routines
                            </Link>
                            <Link to="/access" className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition font-bold text-sm">
                                <Shield className="w-5 h-5" /> Access Codes
                            </Link>
                            <Link to="/forum" className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition font-bold text-sm">
                                <MessageSquare className="w-5 h-5" /> Community Forum
                            </Link>
                        </div>
                    </div>

                    {/* Educator Tip */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">🎓 Educator Tip</p>
                        <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                            Use IEP reports to track individual progress and share with parents. Generate one from Classroom Insights → IEP Report.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducatorDashboard;
