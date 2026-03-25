import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BookOpen, Plus, MoreVertical, Search, GraduationCap, X } from 'lucide-react';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCategory, setNewCategory] = useState('GENERAL');

    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', {
                title: newTitle,
                description: newDesc,
                category: newCategory
            });
            setShowAddModal(false);
            setNewTitle('');
            setNewDesc('');
            fetchCourses();
        } catch (error) {
            console.error('Error creating course', error);
            alert("Failed to create course.");
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'LANGAGE': return 'bg-cyan-100 text-cyan-800';
            case 'MATH': return 'bg-rose-100 text-rose-800';
            case 'EMOTIONS': return 'bg-amber-100 text-amber-800';
            case 'SOCIAL': return 'bg-emerald-100 text-emerald-800';
            case 'VIE_QUOTIDIENNE': return 'bg-violet-100 text-violet-800';
            default: return 'bg-indigo-100 text-indigo-800';
        }
    };

    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight flex items-center">
                        <GraduationCap className="w-12 h-12 mr-4 text-indigo-600" />
                        Curriculum
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg font-medium max-w-2xl">
                        Design comprehensive learning paths. Create courses, organize them into modules, and build interactive lessons.
                    </p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-indigo-700 transition-all font-medium whitespace-nowrap"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Course
                </button>
            </div>

            <div className="mb-8 relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-sm"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-8 h-64 border border-slate-100 animate-pulse flex flex-col justify-between shadow-sm">
                            <div className="w-1/3 h-6 bg-slate-200 rounded-full mb-4"></div>
                            <div className="w-3/4 h-8 bg-slate-200 rounded-xl mb-2"></div>
                            <div className="w-full h-4 bg-slate-200 rounded-full mb-4"></div>
                            <div className="w-full h-4 bg-slate-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Courses Found</h3>
                    <p className="text-slate-500">Get started by creating your first course.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => (
                        <div 
                            key={course.id} 
                            onClick={() => navigate(`/curriculum/${course.id}`)}
                            className="bg-white rounded-[2rem] p-8 border border-white shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-100 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[4rem] -z-10 opacity-50 transition-transform group-hover:scale-110"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase ${getCategoryColor(course.category)}`}>
                                    {course.category}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); /* future context menu */ }}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                                {course.title}
                            </h3>
                            <p className="text-slate-500 font-medium mb-8 flex-1 line-clamp-3">
                                {course.description || "No description provided."}
                            </p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                <div className="flex items-center text-slate-500 font-bold text-sm">
                                    <BookOpen className="w-4 h-4 mr-2 text-indigo-400" />
                                    {course.modules?.length || 0} Modules
                                </div>
                                <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">
                                    View Path &rarr;
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Course Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-bounce-in overflow-hidden">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h2 className="text-2xl font-extrabold text-slate-800">Draft New Course</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCourse} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    placeholder="e.g. Introduction to Social Skills"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                                >
                                    <option value="GENERAL">General</option>
                                    <option value="LANGAGE">Language & Speech</option>
                                    <option value="MATH">Mathematics</option>
                                    <option value="EMOTIONS">Emotions & Feelings</option>
                                    <option value="SOCIAL">Social Skills</option>
                                    <option value="VIE_QUOTIDIENNE">Daily Life</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium min-h-[100px]"
                                    placeholder="Brief outline of reality"
                                ></textarea>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all">Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseList;
