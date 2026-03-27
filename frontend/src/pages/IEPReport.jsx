import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FileText, ArrowLeft, Printer, TrendingUp, Award, Clock, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const CATEGORY_LABELS = {
    LANGAGE: 'Language',
    MATH: 'Mathematics',
    EMOTIONS: 'Emotions',
    SOCIAL: 'Social Skills',
    VIE_QUOTIDIENNE: 'Daily Living',
    GENERAL: 'General',
};

const IEPReport = () => {
    const { childId } = useParams();
    const navigate = useNavigate();
    const reportRef = useRef(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [childId]);

    const fetchReport = async () => {
        try {
            const res = await api.get(`/analytics/child/${childId}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0 minutes';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h} hours ${m} minutes` : `${m} minutes`;
    };

    if (loading) return (
        <div className="p-10 flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
    );

    if (!data) return (
        <div className="p-10 text-center">
            <p className="text-slate-500">Failed to load report data.</p>
        </div>
    );

    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Action bar (hidden on print) */}
            <div className="print:hidden bg-white border-b border-slate-200 px-10 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-600 font-bold hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>
                <button onClick={handlePrint} className="flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                    <Printer className="w-5 h-5 mr-2" /> Print / Save as PDF
                </button>
            </div>

            {/* Printable Report */}
            <div ref={reportRef} className="max-w-4xl mx-auto p-10 print:p-0 print:max-w-none">
                <div className="bg-white rounded-3xl print:rounded-none shadow-xl print:shadow-none border border-slate-100 print:border-none overflow-hidden">
                    {/* REPORT HEADER */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-10 print:p-8">
                        <div className="flex items-center mb-2">
                            <FileText className="w-8 h-8 mr-3" />
                            <span className="text-sm font-bold uppercase tracking-widest opacity-80">LearnAble™ — IEP Progress Report</span>
                        </div>
                        <h1 className="text-4xl font-extrabold mb-2">{data.child.name}</h1>
                        <p className="text-lg opacity-80 font-medium">Age {data.child.age} · Report generated on {reportDate}</p>
                    </div>

                    {/* EXECUTIVE SUMMARY */}
                    <div className="p-10 print:p-8 border-b border-slate-100">
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center">
                            <BarChart3 className="w-6 h-6 mr-2 text-indigo-500" /> Executive Summary
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center bg-indigo-50 p-5 rounded-2xl">
                                <Award className="w-7 h-7 mx-auto text-indigo-600 mb-2" />
                                <p className="text-3xl font-extrabold text-indigo-600">{data.overall.totalCompleted}</p>
                                <p className="text-sm font-bold text-slate-500">Activities Completed</p>
                            </div>
                            <div className="text-center bg-purple-50 p-5 rounded-2xl">
                                <TrendingUp className="w-7 h-7 mx-auto text-purple-600 mb-2" />
                                <p className="text-3xl font-extrabold text-purple-600">{data.overall.avgSuccess.toFixed(0)}%</p>
                                <p className="text-sm font-bold text-slate-500">Average Success Rate</p>
                            </div>
                            <div className="text-center bg-emerald-50 p-5 rounded-2xl">
                                <Clock className="w-7 h-7 mx-auto text-emerald-600 mb-2" />
                                <p className="text-3xl font-extrabold text-emerald-600">{formatTime(data.overall.totalTimeSeconds)}</p>
                                <p className="text-sm font-bold text-slate-500">Total Learning Time</p>
                            </div>
                            <div className="text-center bg-amber-50 p-5 rounded-2xl">
                                <BarChart3 className="w-7 h-7 mx-auto text-amber-600 mb-2" />
                                <p className="text-3xl font-extrabold text-amber-600">{data.overall.totalAttempted}</p>
                                <p className="text-sm font-bold text-slate-500">Total Attempts</p>
                            </div>
                        </div>
                        {data.overall.firstActivity && (
                            <p className="mt-6 text-sm text-slate-500 font-medium">
                                Tracking period: {new Date(data.overall.firstActivity).toLocaleDateString()} — {new Date(data.overall.lastActivity).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* CATEGORY PERFORMANCE */}
                    <div className="p-10 print:p-8 border-b border-slate-100">
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Category Performance Breakdown</h2>
                        {data.categoryBreakdown.length > 0 ? (
                            <>
                                <div className="print:hidden mb-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={data.categoryBreakdown.map(c => ({
                                            subject: CATEGORY_LABELS[c.category] || c.category,
                                            score: c.avgSuccess,
                                            fullMark: 100,
                                        }))}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                            <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200">
                                            <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider">Category</th>
                                            <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider text-center">Attempted</th>
                                            <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider text-center">Completed</th>
                                            <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider text-center">Avg. Success</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.categoryBreakdown.map((cat, idx) => (
                                            <tr key={idx} className="border-b border-slate-100">
                                                <td className="py-4 font-bold text-slate-700">{CATEGORY_LABELS[cat.category] || cat.category}</td>
                                                <td className="py-4 text-center font-bold text-slate-600">{cat.attempts}</td>
                                                <td className="py-4 text-center font-bold text-slate-600">{cat.completed}</td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-lg font-extrabold text-sm ${cat.avgSuccess >= 70 ? 'bg-emerald-100 text-emerald-700' : cat.avgSuccess >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {cat.avgSuccess.toFixed(0)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <p className="text-slate-400 font-medium">No category data available yet.</p>
                        )}
                    </div>

                    {/* 30-DAY TREND */}
                    <div className="p-10 print:p-8 border-b border-slate-100 print:hidden">
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-6">30-Day Activity Trend</h2>
                        {data.dailyTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.dailyTrend}>
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
                                    <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                                    <Bar dataKey="activitiesCount" name="Activities" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-400 font-medium">No recent activity data.</p>
                        )}
                    </div>

                    {/* RECENT COMPLETIONS */}
                    {data.recentLessons?.length > 0 && (
                        <div className="p-10 print:p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Recent Lesson Completions</h2>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-slate-200">
                                        <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider">Lesson</th>
                                        <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider">Category</th>
                                        <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider text-center">Score</th>
                                        <th className="pb-3 text-sm font-extrabold text-slate-400 uppercase tracking-wider text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentLessons.map((lesson, idx) => (
                                        <tr key={idx} className="border-b border-slate-100">
                                            <td className="py-3 font-bold text-slate-700">{lesson.lessonTitle}</td>
                                            <td className="py-3 text-sm font-bold text-slate-500">{CATEGORY_LABELS[lesson.lessonCategory] || lesson.lessonCategory}</td>
                                            <td className="py-3 text-center">
                                                <span className={`px-3 py-1 rounded-lg font-extrabold text-sm ${lesson.successRate >= 70 ? 'bg-emerald-100 text-emerald-700' : lesson.successRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {lesson.successRate?.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-sm text-slate-400 font-medium">{new Date(lesson.completedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="p-10 print:p-8 bg-slate-50 text-center">
                        <p className="text-sm text-slate-400 font-medium">
                            This report was auto-generated by <strong>LearnAble™</strong> on {reportDate}.
                            <br />Data reflects all recorded learning activities within the tracking period.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IEPReport;
