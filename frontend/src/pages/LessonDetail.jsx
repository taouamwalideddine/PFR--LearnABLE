import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Plus, CheckCircle, Clock } from 'lucide-react';

const LessonDetail = () => {
    const { id } = useParams();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading || !lesson) return <div className="p-8 text-center">Loading lesson details...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <Link to="/lessons" className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to lessons
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider mb-3 inline-block">
                                {lesson.category.replace('_', ' ')}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Difficulty Level</div>
                            <div className="text-2xl font-bold text-gray-900">{lesson.difficulty}/5</div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-lg mt-4">{lesson.description}</p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Activity
                    </button>
                </div>

                <div className="space-y-4">
                    {(!lesson.activities || lesson.activities.length === 0) ? (
                        <div className="py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-500">No activities added to this lesson yet.</p>
                        </div>
                    ) : (
                        lesson.activities.map((activity, index) => (
                            <div key={activity.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{activity.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 mr-3">{activity.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 border border-blue-200 rounded-md bg-blue-50">
                                        Edit
                                    </button>
                                    <button className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 border border-red-200 rounded-md bg-red-50">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonDetail;
