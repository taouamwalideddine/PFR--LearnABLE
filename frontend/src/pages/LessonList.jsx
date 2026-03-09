import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpen, Plus, ChevronRight, LayoutList } from 'lucide-react';
import { Link } from 'react-router-dom';

const LessonList = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const response = await api.get('/lessons');
            setLessons(response.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading lessons...</div>;

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
