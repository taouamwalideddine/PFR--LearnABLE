import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Star, Lock, CheckCircle, Map as MapIcon, Play } from 'lucide-react';

const StudentCourseMap = () => {
    const { courseId } = useParams();
    const { activeChild } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [unlockedLessons, setUnlockedLessons] = useState(new Set());

    useEffect(() => {
        if (!activeChild) {
            navigate('/dashboard');
            return;
        }
        fetchCourseAndProgress();
    }, [courseId, activeChild]);

    const fetchCourseAndProgress = async () => {
        try {
            const courseRes = await api.get(`/courses/${courseId}`);
            const courseData = courseRes.data;
            setCourse(courseData);
            
            const progressRes = await api.get(`/progress/child/${activeChild.id}`);
            const completedIds = new Set();
            progressRes.data.forEach(p => {
                if (p.completed && p.activity && p.activity.lesson) {
                    completedIds.add(p.activity.lesson.id);
                }
            });
            setCompletedLessons(completedIds);

            // Compute locked status sequentially
            const unlockedIds = new Set();
            let currentUnlocked = true;
            
            courseData.modules?.forEach(mdl => {
                mdl.lessons?.forEach(lsn => {
                    if (currentUnlocked) {
                        unlockedIds.add(lsn.id);
                    }
                    if (!completedIds.has(lsn.id)) {
                        currentUnlocked = false;
                    }
                });
            });
            setUnlockedLessons(unlockedIds);

        } catch (error) {
            console.error('Failed to load map', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-indigo-50"><div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div></div>;
    if (!course) return <div className="text-center p-10 font-bold text-slate-500">Map not found. Ask your adult for help!</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] overflow-x-hidden relative font-sans">
            {/* Environment Decals */}
            <div className="fixed top-10 left-10 opacity-60 pointer-events-none text-6xl mix-blend-overlay">
                ☁️
            </div>
            <div className="fixed top-32 right-20 opacity-80 pointer-events-none text-8xl mix-blend-overlay">
                ☁️
            </div>
            
            <div className="max-w-4xl mx-auto py-10 px-6 sm:px-8 relative z-10">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-slate-700 font-extrabold hover:text-indigo-800 transition-colors mb-4 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full shadow-sm hover:shadow-md hover:bg-white w-max"
                >
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    Back to Dashboard
                </button>

                <div className="text-center mb-16 animate-fade-in relative">
                    <div className="inline-block p-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-200 mb-6 border-4 border-white transform hover:rotate-12 transition-transform">
                        <MapIcon className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tight drop-shadow-xl mb-4" style={{ textShadow: '2px 4px 0px rgba(255,255,255,0.7)' }}>
                        {course.title}
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-700 font-bold bg-white/60 inline-block px-8 py-3 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
                        Follow the path to earn your prize!
                    </p>
                </div>

                <div className="relative pb-32">
                    {/* The Path Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-white/40 rounded-full transform -translate-x-1/2 border-4 border-white/20"></div>

                    {course.modules?.map((module, mIdx) => (
                        <div key={module.id} className="relative mb-24 z-10">
                            {/* Module Header / Checkpoint */}
                            <div className="flex justify-center mb-16 relative">
                                <div className="bg-gradient-to-b from-indigo-500 to-purple-600 text-white px-10 py-5 rounded-3xl shadow-[0_10px_0_rgb(67,56,202)] border-4 border-white z-10 transform hover:scale-105 transition-transform text-center flex flex-col items-center">
                                    <span className="text-indigo-200 font-black tracking-widest uppercase text-sm mb-1 bg-white/20 px-3 py-1 rounded-full">Zone {mIdx + 1}</span>
                                    <h3 className="text-3xl font-black">{module.title}</h3>
                                </div>
                            </div>

                            {/* Lessons in this Module */}
                            <div className="space-y-12">
                                {module.lessons?.map((lesson, lIdx) => {
                                    // Calculate zigzag position
                                    const isLeft = lIdx % 2 === 0;
                                    const isCompleted = completedLessons.has(lesson.id);
                                    const isUnlocked = unlockedLessons.has(lesson.id);
                                    
                                    return (
                                        <div key={lesson.id} className={`flex items-center w-full relative sm:h-32`}>
                                            <div className={`w-full sm:w-1/2 flex justify-center sm:absolute sm:${isLeft ? 'left-0 pr-16 justify-end' : 'right-0 pl-16 justify-start'}`}>
                                                
                                                <div 
                                                    onClick={() => isUnlocked && navigate(`/lessons/${lesson.id}`)}
                                                    className={`group ${isUnlocked ? 'cursor-pointer transform hover:-translate-y-2' : 'cursor-not-allowed opacity-70 filter grayscale'} transition-all duration-300 relative flex flex-col items-center`}
                                                >
                                                    {/* The Stepping Stone */}
                                                    <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-[0_8px_0_rgb(203,213,225)] border-4 z-20 relative mb-4 flex-shrink-0 transition-all ${
                                                        isCompleted ? 'bg-emerald-400 border-white shadow-[0_8px_0_rgb(52,211,153)] ring-4 ring-emerald-200' : 
                                                        isUnlocked ? 'bg-white border-amber-300 group-hover:border-amber-400 group-hover:shadow-[0_8px_0_rgb(251,191,36)] ring-4 ring-amber-100' : 
                                                        'bg-slate-200 border-slate-300'
                                                    }`}>
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-14 h-14 text-white" />
                                                        ) : isUnlocked ? (
                                                            <Star className="w-12 h-12 text-amber-500 fill-amber-300 animate-pulse" />
                                                        ) : (
                                                            <Lock className="w-10 h-10 text-slate-400" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Label */}
                                                    <div className={`backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border-2 text-center mx-auto min-w-[200px] max-w-[250px] transition-colors ${
                                                        isCompleted ? 'bg-emerald-50 border-emerald-200' :
                                                        isUnlocked ? 'bg-white/90 border-slate-100 group-hover:border-amber-200' : 
                                                        'bg-slate-100 border-slate-200'
                                                    }`}>
                                                        <h4 className={`font-extrabold text-xl ${isCompleted ? 'text-emerald-800' : isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{lesson.title}</h4>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {/* Final Goal */}
                    <div className="flex justify-center mt-32 relative z-10">
                        <div className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full w-48 h-48 flex flex-col items-center justify-center shadow-[0_12px_0_rgb(194,65,12)] border-8 border-white animate-bounce">
                            <Star className="w-20 h-20 text-white fill-current mb-2" />
                            <span className="text-white font-black text-2xl tracking-tight" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}>VICTORY!</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentCourseMap;
