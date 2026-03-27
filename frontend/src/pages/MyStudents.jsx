import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, Activity, Eye, ArrowRight, FileText, MessageCircle } from 'lucide-react';

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/access-codes/my-students');
            setStudents(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading) return (
        <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>
    );

    return (
        <div className="p-8 lg:p-10 max-w-7xl mx-auto min-h-screen">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center mb-3">
                    <Users className="w-10 h-10 mr-4 text-indigo-600" />
                    My Students
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-2xl">
                    Students linked to you via access codes. View their progress, generate reports, and send messages.
                </p>
            </div>

            {students.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-500 mb-2">No Students Linked Yet</h3>
                    <p className="text-slate-400 font-medium mb-6">Ask a parent for a 6-digit access code to link to a student.</p>
                    <Link to="/access" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
                        Go to Access & Linking
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {students.map(student => (
                        <div key={student.linkId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md group-hover:rotate-3 transition-transform">
                                        {student.childName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-800">{student.childName}</h3>
                                        <p className="text-sm font-medium text-slate-400">{student.childAge} years old · Linked {new Date(student.grantedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <Link
                                        to={`/progress/${student.childId}`}
                                        className="flex flex-col items-center py-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition text-slate-600"
                                    >
                                        <Activity className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-bold">Progress</span>
                                    </Link>
                                    <Link
                                        to={`/report/${student.childId}`}
                                        className="flex flex-col items-center py-3 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition text-slate-600"
                                    >
                                        <FileText className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-bold">IEP Report</span>
                                    </Link>
                                    <Link
                                        to={`/messages/${student.childId}`}
                                        className="flex flex-col items-center py-3 bg-slate-50 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition text-slate-600"
                                    >
                                        <MessageCircle className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-bold">Message</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyStudents;
