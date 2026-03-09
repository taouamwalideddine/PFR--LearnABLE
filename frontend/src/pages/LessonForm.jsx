import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LessonForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'LANGAGE',
        description: '',
        difficulty: 1,
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/lessons', formData);
            navigate('/lessons');
        } catch (error) {
            console.error('Error creating lesson:', error);
            alert('Failed to create lesson');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
            <Link to="/lessons" className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to lessons
            </Link>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Lesson</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lesson Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g., Simple Addition, Identifying Emotions"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="LANGAGE">Language</option>
                            <option value="MATHEMATIQUES">Mathematics</option>
                            <option value="EMOTIONS">Emotions</option>
                            <option value="COMPETENCES_SOCIALES">Social Skills</option>
                            <option value="VIE_QUOTIDIENNE">Daily Life</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[120px]"
                            placeholder="What will the child learn in this lesson?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level (1-5)</label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-bold transition shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'
                                }`}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Creating...' : 'Finalize & Create Lesson'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LessonForm;
