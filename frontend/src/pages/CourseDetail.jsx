import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Plus, FolderTree, Book, X, Calendar, UserPlus, Edit2, Trash2 } from 'lucide-react';
import AssignCourseModal from '../components/AssignCourseModal';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState(null);
    const [editingModule, setEditingModule] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);

    // Form states
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/courses/${courseId}`);
            setCourse(response.data);
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveModule = async (e) => {
        e.preventDefault();
        try {
            if (editingModule) {
                await api.put(`/modules/${editingModule.id}`, {
                    title,
                    description: desc
                });
            } else {
                await api.post('/modules', {
                    title,
                    description: desc,
                    courseId,
                    orderIndex: course.modules?.length || 0
                });
            }
            setShowModuleModal(false);
            setEditingModule(null);
            setTitle('');
            setDesc('');
            fetchCourse();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        try {
            if (editingLesson) {
                await api.put(`/lessons/${editingLesson.id}`, {
                    title,
                    description: desc
                });
            } else {
                await api.post('/lessons', {
                    title,
                    category: course.category || 'GENERAL',
                    description: desc,
                    difficulty: 1,
                    moduleId: activeModuleId
                });
            }
            setShowLessonModal(false);
            setEditingLesson(null);
            setTitle('');
            setDesc('');
            setActiveModuleId(null);
            fetchCourse();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteModule = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Delete this module and all its lessons?")) {
            try {
                await api.delete(`/modules/${id}`);
                fetchCourse();
            } catch(e) { console.error(e) }
        }
    };

    const handleDeleteLesson = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Delete this lesson and all its associated progress/activities?")) {
            try {
                await api.delete(`/lessons/${id}`);
                fetchCourse();
            } catch(e) { console.error(e) }
        }
    };

    const openLessonModal = (moduleId) => {
        setEditingLesson(null);
        setActiveModuleId(moduleId);
        setTitle('');
        setDesc('');
        setShowLessonModal(true);
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;
    if (!course) return <div className="p-10 text-center text-slate-500">Course not found.</div>;

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            <button 
                onClick={() => navigate('/curriculum')}
                className="flex items-center text-slate-500 font-bold hover:text-indigo-600 transition-colors mb-8"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Curriculum
            </button>

            <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-slate-100 flex justify-between items-start mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-10 opacity-70"></div>
                <div className="max-w-3xl">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-xl text-xs font-black uppercase tracking-wider mb-4 inline-block">
                        Course • {course.category}
                    </span>
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-4">{course.title}</h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        {course.description || "No description provided."}
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => setShowAssignModal(true)}
                        className="flex text-lg items-center justify-center px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-100 font-bold rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all font-medium whitespace-nowrap"
                    >
                        <UserPlus className="w-5 h-5 mr-3" />
                        Assign to Child
                    </button>
                    <button 
                        onClick={() => {
                            setEditingModule(null);
                            setTitle('');
                            setDesc('');
                            setShowModuleModal(true);
                        }}
                        className="flex text-lg items-center justify-center px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Add Module
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {course.modules?.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                        <FolderTree className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Structure this Course</h3>
                        <p className="text-slate-500">Add modules (chapters) to start building out the curriculum path.</p>
                    </div>
                ) : (
                    course.modules.map((module, index) => (
                        <div key={module.id} className="bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mr-6 shadow-inner text-indigo-700 font-bold text-lg">
                                        M{index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800">{module.title}</h3>
                                        {module.description && <p className="text-slate-500 font-medium">{module.description}</p>}
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingModule(module);
                                            setTitle(module.title);
                                            setDesc(module.description);
                                            setShowModuleModal(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-200 rounded-xl transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteModule(e, module.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <div className="grid gap-4">
                                    {module.lessons?.map((lesson, lIdx) => (
                                        <div 
                                            key={lesson.id}
                                            onClick={() => navigate(`/lessons/${lesson.id}`)}
                                            className="group flex p-4 rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-all items-center"
                                        >
                                            <div className="w-10 h-10 bg-slate-100 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center mr-4 transition-colors">
                                                <Book className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-800">{lesson.title}</h4>
                                                <p className="text-sm text-slate-500 line-clamp-1">{lesson.description}</p>
                                            </div>
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingLesson(lesson);
                                                        setTitle(lesson.title);
                                                        setDesc(lesson.description);
                                                        setActiveModuleId(module.id);
                                                        setShowLessonModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteLesson(e, lesson.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-sm font-bold text-indigo-500 ml-4 hidden sm:block">
                                                Manage Content &rarr;
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        onClick={() => openLessonModal(module.id)}
                                        className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-all flex items-center justify-center"
                                    >
                                        <Plus className="w-5 h-5 mr-2" /> Add Lesson
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for adding Module or Lesson */}
            {(showModuleModal || showLessonModal) && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-bounce-in overflow-hidden">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h2 className="text-2xl font-extrabold text-slate-800">
                                            {showModuleModal 
                                                ? (editingModule ? 'Edit Module' : 'Add New Module') 
                                                : (editingLesson ? 'Edit Lesson' : 'Add New Lesson')
                                            }
                                        </h2>
                                        <button 
                                            onClick={() => {
                                                setShowModuleModal(false);
                                                setShowLessonModal(false);
                                            }}
                                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={showModuleModal ? handleSaveModule : handleSaveLesson} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800"
                                    placeholder={showModuleModal ? "e.g. Chapter 1: Introduction" : "e.g. Recognizing Happy Faces"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 min-h-[100px]"
                                    placeholder="Brief outline of what this covers."
                                ></textarea>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => {setShowModuleModal(false); setShowLessonModal(false);}} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Assigning Course */}
            {showAssignModal && (
                <AssignCourseModal 
                    course={course} 
                    onClose={() => setShowAssignModal(false)} 
                />
            )}
        </div>
    );
};

export default CourseDetail;
