import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
    RadialBarChart, RadialBar, Legend,
} from 'recharts';
import { BarChart3, Users, Clock, Target, TrendingUp, Eye, ArrowRight, FileText } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const ClassroomDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchClassroom();
    }, []);

    const fetchClassroom = async () => {
        try {
            const res = await api.get('/progress/classroom');
            setStudents(res.data);
            if (res.data.length > 0) {
                loadCategories(res.data[0].childId);
                setSelectedChild(res.data[0].childId);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async (childId) => {
        try {
            setSelectedChild(childId);
            const res = await api.get(`/progress/categories/${childId}`);
            setCategories(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const totalStudents = students.length;
    const avgClassSuccess = totalStudents
        ? Math.round(students.reduce((s, c) => s + c.avgSuccess, 0) / totalStudents)
        : 0;
    const totalActivities = students.reduce((s, c) => s + c.totalCompleted, 0);
    const totalTimeMins = Math.round(students.reduce((s, c) => s + c.totalTimeSeconds, 0) / 60);

    if (loading) return (
        <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>
    );

    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight flex items-center mb-3">
                    <BarChart3 className="w-10 h-10 lg:w-12 lg:h-12 mr-4 text-indigo-600" />
                    Classroom Insights
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-2xl">
                    Bird's-eye view of your students' performance, time spent, and areas of strength or concern.
                </p>
            </div>

            {/* Global Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 p-2.5 rounded-xl"><Users className="w-5 h-5 text-indigo-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{totalStudents}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Total Students</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-emerald-100 p-2.5 rounded-xl"><Target className="w-5 h-5 text-emerald-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{avgClassSuccess}%</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Class Avg Success</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-amber-100 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{totalActivities}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Activities Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2.5 rounded-xl"><Clock className="w-5 h-5 text-purple-600" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800">{totalTimeMins} min</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">Total Learning Time</p>
                </div>
            </div>

            {/* Student Roster */}
            <div className="mb-10">
                <h2 className="text-xl font-extrabold text-slate-800 mb-5">Student Roster</h2>
                {students.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No students found. Add child profiles from the "My Children" section.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {students.map((student, i) => {
                            const isActive = selectedChild === student.childId;
                            const successColor = student.avgSuccess >= 80 ? 'text-emerald-600 bg-emerald-50' 
                                : student.avgSuccess >= 50 ? 'text-amber-600 bg-amber-50' 
                                : 'text-rose-600 bg-rose-50';
                            return (
                                <div
                                    key={student.childId}
                                    onClick={() => loadCategories(student.childId)}
                                    className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all hover:shadow-md ${isActive ? 'border-indigo-400 shadow-lg shadow-indigo-100 ring-1 ring-indigo-200' : 'border-slate-100'}`}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                                            {student.childName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-800 text-lg">{student.childName}</h3>
                                            <p className="text-sm font-medium text-slate-400">{student.childAge} years old</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                                            <p className="text-lg font-extrabold text-slate-700">{student.totalCompleted}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Done</p>
                                        </div>
                                        <div className={`rounded-xl p-3 text-center ${successColor}`}>
                                            <p className="text-lg font-extrabold">{Math.round(student.avgSuccess)}%</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">Score</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                                            <p className="text-lg font-extrabold text-slate-700">{Math.round(student.totalTimeSeconds / 60)}m</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <Link 
                                            to={`/report/${student.childId}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-xs font-bold text-emerald-500 hover:text-emerald-700 flex items-center gap-1"
                                        >
                                            <FileText className="w-3.5 h-3.5" /> IEP Report
                                        </Link>
                                        <Link 
                                            to={`/progress/${student.childId}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Full Report <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Category Breakdown Chart */}
            {selectedChild && (
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Success by Category — {students.find(s => s.childId === selectedChild)?.childName}
                    </h2>
                    {categories.length === 0 ? (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 font-medium">Not enough data yet. Complete some activities first!</p>
                        </div>
                    ) : (
                        <div className="h-72 lg:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categories} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        domain={[0, 100]} 
                                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 600 }}
                                        formatter={(v) => [`${Math.round(v)}%`, 'Avg Success']}
                                    />
                                    <Bar dataKey="avgSuccess" radius={[8, 8, 0, 0]} barSize={56}>
                                        {categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassroomDashboard;
