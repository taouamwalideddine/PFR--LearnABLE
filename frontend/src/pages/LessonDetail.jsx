import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Plus, Play, X, Trophy, CheckCircle } from 'lucide-react';
import ActivityEngine from '../components/activities/ActivityEngine';
import AddActivityModal from '../components/AddActivityModal';
import { useAuth } from '../context/AuthContext';

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeChild } = useAuth();
    
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // adult state
    const [previewActivity, setPreviewActivity] = useState(null);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    
    // child state
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [lessonCompleted, setLessonCompleted] = useState(false);

    useEffect(() => {
        fetchLessonDetails();
    }, [id]);

    const fetchLessonDetails = async () => {
        try {
            const response = await api.get(`/lessons/${id}`);
            setLesson(response.data);
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!window.confirm("Are you sure you want to delete this activity?")) return;
        try {
            await api.delete(`/activities/${activityId}`);
            fetchLessonDetails();
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert("Failed to delete activity.");
        }
    };

    const handleEditActivity = (activity) => {
        setEditingActivity(activity);
        setShowAddActivity(true);
    };

    const handleChildActivityFinished = (success) => {
        if (currentActivityIndex < (lesson?.activities?.length || 1) - 1) {
            setCurrentActivityIndex(prev => prev + 1);
        } else {
            setLessonCompleted(true);
        }
    };

    if (loading || !lesson) return <div className="p-8 text-center flex-1 flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    // immersive player
    if (activeChild) {
        if (!lesson.activities || lesson.activities.length === 0) {
            return (
                <div className="flex-1 min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                    <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-xl text-center max-w-lg border border-white">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🚧</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Under Construction!</h2>
                        <p className="text-xl text-slate-500 font-medium mb-8">This lesson doesn't have any activities yet.</p>
                        <button onClick={() => navigate('/lessons')} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-xl w-full">
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        if (lessonCompleted) {
            return (
                <div className="flex-1 min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden">
                    {/* Confetti / Decoration elements */}
                    <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    
                    <div className="bg-white/90 backdrop-blur-2xl p-16 rounded-[3rem] shadow-2xl text-center max-w-2xl border border-white relative z-10 animate-bounce-in">
                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-yellow-200">
                            <Trophy className="w-16 h-16 text-white" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 mb-4">Lesson Complete!</h1>
                        <p className="text-2xl text-slate-600 font-bold mb-10">Amazing job, {activeChild.name}! You finished <span className="text-indigo-600">{lesson.title}</span>.</p>
                        
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => navigate(lesson.module?.course ? `/map/${lesson.module.course.id}` : '/dashboard')} 
                                className="px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all text-xl"
                            >
                                {lesson.module?.course ? 'Back to Map' : 'Return Home'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const activeCurrentActivity = lesson.activities[currentActivityIndex];

        return (
            <div className="flex-1 min-h-[calc(100vh-2rem)] bg-slate-50 flex flex-col p-4 md:p-8 relative">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate('/lessons')} className="flex items-center px-4 py-2 bg-white rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 font-bold transition-colors border border-slate-100">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Exit
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {lesson.activities.map((_, idx) => (
                            <div key={idx} className={`w-3 h-3 rounded-full transition-all ${idx === currentActivityIndex ? 'bg-indigo-600 w-8' : idx < currentActivityIndex ? 'bg-green-500' : 'bg-slate-300'}`} />
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative flex flex-col items-center justify-center p-4">
                    <ActivityEngine
                        activity={activeCurrentActivity}
                        childId={activeChild.id}
                        onFinished={handleChildActivityFinished}
                    />
                </div>
            </div>
        );
    }

    // builder ui
    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <Link to="/lessons" className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition font-bold w-max">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to all lessons
            </Link>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[10rem] -mr-8 -mt-8 pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <span className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-100 text-indigo-800 uppercase tracking-widest mb-4 inline-block">
                            {lesson.category.replace('_', ' ')}
                        </span>
                        <h1 className="text-4xl font-extrabold text-slate-900">{lesson.title}</h1>
                    </div>
                    <div className="text-right bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Difficulty</div>
                        <div className="text-3xl font-extrabold text-indigo-600">Lvl {lesson.difficulty || 1}</div>
                    </div>
                </div>
                <p className="text-slate-600 text-lg font-medium max-w-3xl relative z-10">{lesson.description}</p>
            </div>

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900">Activities Sequence</h2>
                <button 
                    onClick={() => setShowAddActivity(true)}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Activity
                </button>
            </div>

            <div className="space-y-4">
                {(!lesson.activities || lesson.activities.length === 0) ? (
                    <div className="py-16 text-center bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-300">
                        <p className="text-slate-500 font-medium text-lg">No activities added to this lesson yet.</p>
                        <button onClick={() => setShowAddActivity(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Click 'New Activity' to build the curriculum</button>
                    </div>
                ) : (
                    lesson.activities.map((activity, index) => (
                        <div key={activity.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-indigo-100 transition-all group">
                            <div className="flex items-center">
                                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xl mr-6 group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{activity.title}</h3>
                                    <div className="flex items-center text-sm font-bold text-slate-400">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 uppercase tracking-wider text-xs">{activity.type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-3 items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setPreviewActivity(activity)}
                                    className="text-emerald-600 hover:text-emerald-700 text-sm font-bold px-5 py-2.5 border-2 border-emerald-100 rounded-xl bg-emerald-50 flex items-center shadow-sm hover:shadow-md transition-all"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Preview
                                </button>
                                <button 
                                    onClick={() => handleEditActivity(activity)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-bold px-4 py-2 border-2 border-transparent hover:border-indigo-100 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteActivity(activity.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-bold px-4 py-2 border-2 border-transparent hover:border-red-100 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Parent Modal For Previews */}
            {previewActivity && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-bounce-in flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center">
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-xl text-xs uppercase tracking-wider mr-4 shadow-sm">Preview</span>
                                {previewActivity.title}
                            </h2>
                            <button
                                onClick={() => setPreviewActivity(null)}
                                className="p-3 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors focus:ring-2 focus:ring-slate-300 outline-none"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 flex-1 flex items-center justify-center relative overflow-y-auto bg-slate-50">
                            <ActivityEngine
                                activity={previewActivity}
                                childId="preview-mode"
                                onFinished={(success) => {
                                    setPreviewActivity(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showAddActivity && (
                <AddActivityModal 
                    lessonId={lesson.id}
                    initialData={editingActivity}
                    onClose={() => {
                        setShowAddActivity(false);
                        setEditingActivity(null);
                    }}
                    onSuccess={() => {
                        setShowAddActivity(false);
                        setEditingActivity(null);
                        fetchLessonDetails();
                    }}
                />
            )}
        </div>
    );
};

export default LessonDetail;
