import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, CheckCircle, Plus } from 'lucide-react';

const AssignCourseModal = ({ course, onClose }) => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await api.get('/children');
                setChildren(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    const handleAssign = async (childId) => {
        setAssigningId(childId);
        try {
            await api.post(`/courses/${course.id}/assign`, { childId });
            setChildren(children.map(c => c.id === childId ? { ...c, justAssigned: true } : c));
        } catch (err) {
            console.error('Failed to assign', err);
            alert('Failed to assign course');
        } finally {
            setAssigningId(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-bounce-in">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-extrabold text-slate-800">Assign "{course.title}"</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm font-bold text-slate-500 mb-6">Select a child to assign this full curriculum mapping to. They will explore it dynamically through the Student Map.</p>
                    {loading ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div></div>
                    ) : children.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 font-medium">No children found. Manage profiles to add children.</div>
                    ) : (
                        <div className="space-y-4">
                            {children.map(child => (
                                <div key={child.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors shadow-sm">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xl mr-4 shadow-sm">
                                            {child.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-800 text-lg">{child.name}</h3>
                                            <p className="text-xs font-bold text-slate-400">Level {child.difficultyLevel}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(child.id)}
                                        disabled={assigningId === child.id || child.justAssigned || (course.children && course.children.some(c => c.id === child.id))}
                                        className={`px-4 py-2.5 font-bold rounded-xl flex items-center text-sm transition-all ${
                                            child.justAssigned || (course.children && course.children.some(c => c.id === child.id))
                                                ? 'bg-emerald-50 text-emerald-600 cursor-not-allowed border border-emerald-100'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        {child.justAssigned || (course.children && course.children.some(c => c.id === child.id)) ? (
                                            <><CheckCircle className="w-4 h-4 mr-2" /> Assigned</>
                                        ) : assigningId === child.id ? (
                                            'Assigning...'
                                        ) : (
                                            <><Plus className="w-4 h-4 mr-2" /> Assign</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignCourseModal;
