import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, ArrowLeft, User, Target, Clock, Activity, BarChart3 } from 'lucide-react';

const IEPReport = () => {
    const { childId } = useParams();
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [history, setHistory] = useState([]);
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchData();
    }, [childId]);

    const fetchData = async () => {
        try {
            const [statsRes, catRes, histRes, childRes] = await Promise.all([
                api.get(`/progress/stats/${childId}`),
                api.get(`/progress/categories/${childId}`),
                api.get(`/progress/child/${childId}`),
                api.get(`/children/${childId}`),
            ]);
            setStats(statsRes.data);
            setCategories(catRes.data);
            setHistory(histRes.data);
            setChild(childRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Header
            doc.setFillColor(99, 102, 241);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('LearnAble — IEP Progress Report', 14, 22);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${dateStr}`, 14, 32);

            // Student Info
            doc.setTextColor(30, 41, 59);
            let y = 55;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Student Information', 14, y);
            y += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${child?.name || 'N/A'}`, 14, y);
            y += 7;
            doc.text(`Age: ${child?.age || 'N/A'} years`, 14, y);
            y += 7;
            doc.text(`Learning Pace: ${child?.learningPace || 'Standard'}`, 14, y);
            y += 7;
            doc.text(`Difficulty Level: ${child?.difficultyLevel || 1}`, 14, y);
            y += 15;

            // Performance Summary
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Performance Summary', 14, y);
            y += 3;

            autoTable(doc, {
                startY: y,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Activities Attempted', String(stats?.totalActivitiesAttempted || 0)],
                    ['Total Activities Completed', String(stats?.totalActivitiesCompleted || 0)],
                    ['Average Success Rate', `${Math.round(stats?.averageSuccessRate || 0)}%`],
                    ['Total Learning Time', `${Math.round((stats?.totalTimeSpentSeconds || 0) / 60)} minutes`],
                ],
                theme: 'striped',
                headStyles: { fillColor: [99, 102, 241], font: 'helvetica', fontStyle: 'bold' },
                styles: { font: 'helvetica', fontSize: 10 },
                margin: { left: 14 },
            });

            y = doc.lastAutoTable.finalY + 15;

            // Category Breakdown
            if (categories.length > 0) {
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Success by Category', 14, y);
                y += 3;

                autoTable(doc, {
                    startY: y,
                    head: [['Category', 'Activities', 'Success Rate']],
                    body: categories.map(c => [
                        c.category,
                        String(c.count),
                        `${Math.round(c.avgSuccess)}%`,
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [16, 185, 129], font: 'helvetica', fontStyle: 'bold' },
                    styles: { font: 'helvetica', fontSize: 10 },
                    margin: { left: 14 },
                });

                y = doc.lastAutoTable.finalY + 15;
            }

            // Recent Activity Log
            if (history.length > 0) {
                if (y > 240) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Recent Activity Log', 14, y);
                y += 3;

                const recentItems = history.slice(0, 15).map(item => [
                    new Date(item.timestamp).toLocaleDateString(),
                    item.activity?.title || 'Unknown',
                    item.completed ? 'Yes' : 'No',
                    `${Math.round(item.successRate)}%`,
                    `${Math.round(item.timeSpent / 60)}m`,
                ]);

                autoTable(doc, {
                    startY: y,
                    head: [['Date', 'Activity', 'Completed', 'Score', 'Time']],
                    body: recentItems,
                    theme: 'striped',
                    headStyles: { fillColor: [245, 158, 11], font: 'helvetica', fontStyle: 'bold' },
                    styles: { font: 'helvetica', fontSize: 9 },
                    margin: { left: 14 },
                });

                y = doc.lastAutoTable.finalY + 15;
            }

            // Footer
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setDrawColor(200, 200, 200);
            doc.line(14, y, 196, y);
            y += 8;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('This report was automatically generated by the LearnAble platform.', 14, y);
            doc.text('For questions, contact the assigned educator or administrator.', 14, y + 5);
            doc.text(`Confidential — ${dateStr}`, 14, y + 10);

            doc.save(`IEP_Report_${child?.name || 'Student'}_${now.toISOString().slice(0, 10)}.pdf`);
        } catch (e) {
            console.error('PDF generation failed:', e);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return (
        <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>
    );

    return (
        <div className="p-8 lg:p-10 max-w-5xl mx-auto min-h-screen">
            <Link to="/classroom" className="flex items-center text-slate-500 hover:text-slate-700 mb-8 transition font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Classroom
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center mb-3">
                        <FileText className="w-10 h-10 mr-4 text-indigo-600" />
                        IEP Report Preview
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Review the data below, then export a professional PDF for IEP meetings.
                    </p>
                </div>
                <button
                    onClick={generatePDF}
                    disabled={generating}
                    className="flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-indigo-700 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                    <Download className="w-5 h-5 mr-2" />
                    {generating ? 'Generating...' : 'Export PDF'}
                </button>
            </div>

            {/* Student Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6 flex items-center gap-5">
                <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                    {child?.name?.charAt(0) || '?'}
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800">{child?.name}</h2>
                    <p className="text-sm font-medium text-slate-400">{child?.age} years old — Level {child?.difficultyLevel} — Pace: {child?.learningPace || 'Standard'}</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <Activity className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-2xl font-extrabold text-slate-800">{stats?.totalActivitiesCompleted || 0}</p>
                    <p className="text-xs font-bold text-slate-400">Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <Target className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-2xl font-extrabold text-slate-800">{Math.round(stats?.averageSuccessRate || 0)}%</p>
                    <p className="text-xs font-bold text-slate-400">Avg Success</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <Clock className="w-5 h-5 text-purple-500 mb-2" />
                    <p className="text-2xl font-extrabold text-slate-800">{Math.round((stats?.totalTimeSpentSeconds || 0) / 60)} min</p>
                    <p className="text-xs font-bold text-slate-400">Learning Time</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <User className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-2xl font-extrabold text-slate-800">{stats?.totalActivitiesAttempted || 0}</p>
                    <p className="text-xs font-bold text-slate-400">Attempted</p>
                </div>
            </div>

            {/* Category Breakdown */}
            {categories.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" /> Success by Category
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map((c, i) => {
                            const colors = ['bg-indigo-50 text-indigo-700', 'bg-emerald-50 text-emerald-700', 'bg-amber-50 text-amber-700', 'bg-pink-50 text-pink-700', 'bg-purple-50 text-purple-700', 'bg-cyan-50 text-cyan-700'];
                            return (
                                <div key={i} className={`rounded-xl p-4 ${colors[i % colors.length]}`}>
                                    <p className="text-sm font-extrabold uppercase tracking-wider mb-1">{c.category}</p>
                                    <p className="text-2xl font-extrabold">{Math.round(c.avgSuccess)}%</p>
                                    <p className="text-xs font-bold opacity-60">{c.count} activities</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Activity Table */}
            {history.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-4">Recent Activity Log</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-2 font-bold text-slate-500">Date</th>
                                    <th className="text-left py-3 px-2 font-bold text-slate-500">Activity</th>
                                    <th className="text-center py-3 px-2 font-bold text-slate-500">Done</th>
                                    <th className="text-center py-3 px-2 font-bold text-slate-500">Score</th>
                                    <th className="text-center py-3 px-2 font-bold text-slate-500">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.slice(0, 15).map((item, i) => (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="py-3 px-2 font-medium text-slate-600">{new Date(item.timestamp).toLocaleDateString()}</td>
                                        <td className="py-3 px-2 font-bold text-slate-800">{item.activity?.title || 'Unknown'}</td>
                                        <td className="py-3 px-2 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {item.completed ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center font-extrabold text-slate-700">{Math.round(item.successRate)}%</td>
                                        <td className="py-3 px-2 text-center font-medium text-slate-500">{Math.round(item.timeSpent / 60)}m</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IEPReport;
