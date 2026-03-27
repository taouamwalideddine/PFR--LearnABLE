import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, Activity, PlayCircle, BookOpen, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ManageLessonsModal from '../components/ManageLessonsModal';

const ChildProfiles = () => {
    const { switchChild } = useAuth();
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedChildForLessons, setSelectedChildForLessons] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        learningPace: 'NORMAL',
        difficultyLevel: 1,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await api.get('/children');
            setChildren(response.data);
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                age: formData.age,
                learningPace: formData.learningPace,
                difficultyLevel: formData.difficultyLevel,
            };
            await api.post('/children', payload);
            setShowAddForm(false);
            fetchChildren();
            setFormData({
                name: '',
                age: '',
                learningPace: 'NORMAL',
                difficultyLevel: 1,
            });
        } catch (error) {
            console.error('Error creating child:', error);
        }
    };

    const handlePlayAsChild = (child) => {
        switchChild(child);
        navigate('/dashboard');
    };

    const handleDeleteChild = async (childId) => {
        if (!window.confirm("Are you sure you want to permanently delete this child profile? This cannot be undone.")) return;
        try {
            await api.delete(`/children/${childId}`);
            fetchChildren();
        } catch (err) {
            console.error('Error deleting child:', err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profiles...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2">My Children</h1>
                    <p className="text-lg text-slate-500 font-medium">Manage profiles and learning preferences.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1"
                >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Add Profile
                </button>
            </div>

            {showAddForm && (
                <div className="mb-12 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[10rem] -mr-8 -mt-8 pointer-events-none"></div>
                    <h2 className="text-2xl font-bold mb-8 text-slate-800 relative z-10">New Child Profile</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                            <input
                                type="text"
                                required
                                className="block w-full border-slate-200 bg-slate-50 rounded-xl shadow-sm p-3 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all border outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                            <input
                                type="number"
                                required
                                className="block w-full border-slate-200 bg-slate-50 rounded-xl shadow-sm p-3 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all border outline-none"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Learning Pace</label>
                            <select
                                className="block w-full border-slate-200 bg-slate-50 rounded-xl shadow-sm p-3 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all border outline-none"
                                value={formData.learningPace}
                                onChange={(e) => setFormData({ ...formData, learningPace: e.target.value })}
                            >
                                <option value="SLOW">Personalized / Slow</option>
                                <option value="NORMAL">Standard</option>
                                <option value="FAST">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty Level (1-5)</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                className="mt-2 block w-full accent-indigo-600"
                                value={formData.difficultyLevel}
                                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                            />
                            <div className="text-sm font-bold text-indigo-600 mt-2 text-right">Level {formData.difficultyLevel}</div>
                        </div>


                        <div className="md:col-span-2 pt-6">
                            <button
                                type="submit"
                                className="w-full bg-slate-900 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {children.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg font-medium">No children profiles found.<br/>Click 'Add Profile' to get started!</p>
                    </div>
                ) : (
                    children.map((child) => (
                        <div key={child.id} className="group relative bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[6rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 pointer-events-none"></div>
                            
                            <div className="p-8 flex-1 relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center text-3xl font-extrabold transform group-hover:rotate-6 transition-transform">
                                        {child.name.charAt(0)}
                                    </div>
                                    <div className="flex space-x-2">
                                    </div>
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{child.name}</h3>
                                <div className="flex items-center text-sm font-bold text-slate-400 mb-6 space-x-4">
                                    <span className="bg-slate-100 px-3 py-1 rounded-lg">{child.age} years old</span>
                                    <span className="bg-slate-100 px-3 py-1 rounded-lg">Level {child.difficultyLevel}</span>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col gap-3 relative z-10">
                                <button
                                    onClick={() => handlePlayAsChild(child)}
                                    className="w-full flex justify-center items-center py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                >
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    Play as {child.name}
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSelectedChildForLessons(child)}
                                        className="w-full flex justify-center items-center py-3 bg-white text-indigo-600 font-bold border-2 border-indigo-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                    >
                                        <BookOpen className="w-5 h-5 mr-2" />
                                        Lessons
                                    </button>
                                    <Link
                                        to={`/progress/${child.id}`}
                                        className="w-full flex justify-center items-center py-3 bg-white text-slate-700 font-bold border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-colors"
                                    >
                                        <Activity className="w-5 h-5 mr-2 text-slate-400" />
                                        Progress
                                    </Link>
                                </div>
                                <button
                                    onClick={() => handleDeleteChild(child.id)}
                                    className="w-full flex justify-center items-center py-3 text-rose-500 font-bold border-2 border-rose-100 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors mt-3"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Profile
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Manage Lessons Modal */}
            {selectedChildForLessons && (
                <ManageLessonsModal 
                    child={selectedChildForLessons} 
                    onClose={() => setSelectedChildForLessons(null)} 
                />
            )}
        </div>
    );
};

export default ChildProfiles;
