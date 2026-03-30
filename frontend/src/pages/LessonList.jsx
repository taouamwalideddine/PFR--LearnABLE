import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpen, Plus, ChevronRight, LayoutList, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LessonList = () => {
    const { activeChild } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLessons();
    }, [activeChild]);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            let response;
            if (activeChild) {
                // child assigned lessons
                response = await api.get(`/children/${activeChild.id}/lessons`);
            } else {
                // adult all lessons
                response = await api.get('/lessons');
            }
            setLessons(response.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading lessons...</div>;

    // student view
    if (activeChild) {
        return (
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12 animate-fade-in">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">My Lessons</h1>
                        <p className="text-lg text-slate-500 font-medium">Lessons chosen just for you!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {lessons.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-300">
                            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-xl font-bold">No lessons assigned yet.<br/>Ask your parent or teacher to add some!</p>
                        </div>
                    ) : (
                        lessons.map((lesson) => (
                            <div key={lesson.id} className="group relative bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer animate-bounce-in">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[6rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none"></div>
                                
                                <div className="p-8 flex-1 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{lesson.title}</h3>
                                    <p className="text-slate-500 font-medium mb-6 line-clamp-2">
                                        {lesson.description || 'Ready to learn?'}
                                    </p>
                                </div>
                                
                                <div className="bg-slate-50/50 border-t border-slate-100 p-6 relative z-10">
                                    <Link
                                        to={`/lessons/${lesson.id}`}
                                        className="w-full flex justify-center items-center py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                    >
                                        <PlayCircle className="w-6 h-6 mr-2" />
                                        Start Lesson
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // adult view
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Education Center</h1>
                    <Link
                        to="/lessons/new"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Lesson
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-300">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No lessons created yet.</p>
                            <Link to="/lessons/new" className="text-blue-600 font-medium">Create your first lesson</Link>
                        </div>
                    ) : (
                        lessons.map((lesson) => (
                            <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group h-full flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase tracking-wider">
                                            {lesson.category.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400">
                                            Difficulty: {lesson.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {lesson.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <LayoutList className="w-4 h-4 mr-2" />
                                        {lesson.activities?.length || 0} Activities
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 mt-auto border-t border-gray-100 flex justify-between items-center">
                                    <Link
                                        to={`/lessons/${lesson.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center transition"
                                    >
                                        Manage & Add Activities
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonList;
