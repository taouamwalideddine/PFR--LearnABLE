import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
    Users, GraduationCap, Trophy, BarChart3, Calendar, Shield, MessageSquare,
    ArrowRight, TrendingUp, Clock, Target, BookOpen, Sparkles, ChevronRight
} from 'lucide-react';

const ParentDashboard = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [stats, setStats] = useState({ totalLessons: 0, totalCourses: 0 });
    const [recentProgress, setRecentProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [childRes, classRes] = await Promise.all([
                api.get('/children'),
                api.get('/progress/classroom'),
            ]);
            setChildren(childRes.data);
            setRecentProgress(classRes.data);

            // Calculate aggregate stats
            const totalCompleted = classRes.data.reduce((s, c) => s + c.totalCompleted, 0);
            const avgSuccess = classRes.data.length 
                ? Math.round(classRes.data.reduce((s, c) => s + c.avgSuccess, 0) / classRes.data.length) 
                : 0;
            const totalTime = Math.round(classRes.data.reduce((s, c) => s + c.totalTimeSeconds, 0) / 60);
            setStats({ totalCompleted, avgSuccess, totalTime });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    const firstName = user?.email?.split('@')[0] || 'Parent';

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-10 min-h-screen">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 lg:p-10 mb-8 overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-16 -mb-16 blur-xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Parent Dashboard</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
                        Welcome back, {firstName}! 👋
                    </h1>
                    <p className="text-lg text-white/70 font-medium max-w-xl">
                        Here's how your children are doing. Keep up the great work supporting their learning journey.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 p-2.5 rounded-xl"><Users className="w-5 h-5 text-indigo-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{children.length}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Children</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-emerald-100 p-2.5 rounded-xl"><Target className="w-5 h-5 text-emerald-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{stats.avgSuccess}%</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Avg Success</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-amber-100 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{stats.totalCompleted}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2.5 rounded-xl"><Clock className="w-5 h-5 text-purple-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{stats.totalTime} min</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Learning Time</p>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Children Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> My Children
                        </h2>
                        <Link to="/children" className="text-sm font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition">
                            View all <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {children.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No children added yet.</p>
                            <Link to="/children" className="text-indigo-600 font-bold text-sm mt-2 inline-block hover:underline">Add a child →</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {children.map(child => {
                                const prog = recentProgress.find(p => p.childId === child.id);
                                const success = prog ? Math.round(prog.avgSuccess) : 0;
                                const barColor = success >= 80 ? 'bg-emerald-500' : success >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                                return (
                                    <Link to={`/progress/${child.id}`} key={child.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 transition group">
                                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                                            {child.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-extrabold text-slate-800 truncate">{child.name}</p>
                                            <p className="text-xs font-medium text-slate-400">{child.age} yrs · Level {child.difficultyLevel}</p>
                                        </div>
                                        <div className="w-24">
                                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                                <span>Success</span><span>{success}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${success}%` }}></div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-extrabold text-slate-800 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link to="/children" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition font-bold text-sm">
                                <Users className="w-5 h-5" /> Manage Children
                            </Link>
                            <Link to="/curriculum" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition font-bold text-sm">
                                <GraduationCap className="w-5 h-5" /> Browse Curriculum
                            </Link>
                            <Link to="/routines" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-bold text-sm">
                                <Calendar className="w-5 h-5" /> Manage Routines
                            </Link>
                            <Link to="/classroom" className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-bold text-sm">
                                <BarChart3 className="w-5 h-5" /> Classroom Insights
                            </Link>
                            <Link to="/access" className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition font-bold text-sm">
                                <Shield className="w-5 h-5" /> Access & Linking
                            </Link>
                            <Link to="/forum" className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition font-bold text-sm">
                                <MessageSquare className="w-5 h-5" /> Community Forum
                            </Link>
                        </div>
                    </div>

                    {/* Tip Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">💡 Tip of the Day</p>
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            Consistent, short learning sessions (15-20 min) are more effective than long ones. Use routines to build habits!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
