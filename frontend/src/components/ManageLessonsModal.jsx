import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, CheckCircle, PlusCircle, Trash2, Search, BookOpen } from 'lucide-react';

const ManageLessonsModal = ({ child, onClose }) => {
    const [allLessons, setAllLessons] = useState([]);
    const [assignedLessons, setAssignedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all lessons available on the platform
                const allRes = await api.get('/lessons');
                // Fetch lessons already assigned to this child
                const assignedRes = await api.get(`/children/${child.id}/lessons`);
                
                setAllLessons(allRes.data);
                setAssignedLessons(assignedRes.data);
            } catch (error) {
                console.error("Error fetching lessons data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [child.id]);

    const handleAssign = async (lesson) => {
        try {
            await api.post(`/children/${child.id}/lessons`, { lessonId: lesson.id });
            setAssignedLessons([...assignedLessons, lesson]);
        } catch (error) {
            console.error("Error assigning lesson:", error);
        }
    };

    const handleRemove = async (lessonId) => {
        try {
            await api.delete(`/children/${child.id}/lessons/${lessonId}`);
            setAssignedLessons(assignedLessons.filter(l => l.id !== lessonId));
        } catch (error) {
            console.error("Error removing lesson:", error);
        }
    };

    const isAssigned = (lessonId) => {
        return assignedLessons.some(l => l.id === lessonId);
    };

    const filteredLessons = allLessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lesson.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-bounce-in border border-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-bl-[10rem] -mr-8 -mt-8 pointer-events-none"></div>

                <div className="flex justify-between items-center p-8 border-b border-slate-100/50 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-800">Assign Lessons</h2>
                            <p className="text-slate-500 font-medium mt-1">Curating curriculum for <span className="text-indigo-600 font-bold">{child.name}</span></p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 z-10">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Search Bar */}
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="text"
                                    placeholder="Search lessons by title or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredLessons.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-slate-500 font-medium">
                                        No lessons found matching your search.
                                    </div>
                                ) : (
                                    filteredLessons.map(lesson => {
                                        const assigned = isAssigned(lesson.id);
                                        return (
                                            <div 
                                                key={lesson.id}
                                                className={`p-6 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center group ${
                                                    assigned 
                                                    ? 'bg-indigo-50/50 border-indigo-200 shadow-[0_4px_20px_rgb(99,102,241,0.1)] hover:border-indigo-300' 
                                                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 uppercase tracking-wider">
                                                            {lesson.category}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                                            lesson.difficultyLevel <= 2 ? 'bg-green-100 text-green-700' :
                                                            lesson.difficultyLevel === 3 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            Lvl {lesson.difficultyLevel}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{lesson.title}</h3>
                                                </div>
                                                
                                                <div>
                                                    {assigned ? (
                                                        <button 
                                                            onClick={() => handleRemove(lesson.id)}
                                                            className="flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                                                            title="Remove from child's curriculum"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAssign(lesson)}
                                                            className="flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                                                            title="Assign to child"
                                                        >
                                                            <PlusCircle className="w-5 h-5 mr-2" />
                                                            Assign
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100/50 bg-slate-50/50 flex justify-between items-center z-10">
                    <p className="text-slate-500 font-medium">
                        <span className="text-indigo-600 font-bold">{assignedLessons.length}</span> active lessons for this child
                    </p>
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageLessonsModal;
