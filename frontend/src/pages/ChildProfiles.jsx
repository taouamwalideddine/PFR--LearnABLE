import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, Settings, Headphones, VolumeX, Eye, Activity } from 'lucide-react';

const [children, setChildren] = useState([]);
const [showAddForm, setShowAddForm] = useState(false);
const [formData, setFormData] = useState({
    name: '',
    age: '',
    learningPace: 'NORMAL',
    difficultyLevel: 1,
    lowStimulation: false,
    soundEnabled: true,
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
            sensoryPreferences: {
                lowStimulation: formData.lowStimulation,
                soundEnabled: formData.soundEnabled,
            },
        };
        await api.post('/children', payload);
        setShowAddForm(false);
        fetchChildren();
        setFormData({
            name: '',
            age: '',
            learningPace: 'NORMAL',
            difficultyLevel: 1,
            lowStimulation: false,
            soundEnabled: true,
        });
    } catch (error) {
        console.error('Error creating child:', error);
    }
};

if (loading) return <div className="p-8 text-center">Loading profiles...</div>;

return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Child Profiles</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add Profile
                </button>
            </div>

            {showAddForm && (
                <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">New Child Profile</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Learning Pace</label>
                            <select
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                                value={formData.learningPace}
                                onChange={(e) => setFormData({ ...formData, learningPace: e.target.value })}
                            >
                                <option value="SLOW">Personalized / Slow</option>
                                <option value="NORMAL">Standard</option>
                                <option value="FAST">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty Level (1-5)</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                className="mt-1 block w-full"
                                value={formData.difficultyLevel}
                                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                            />
                            <div className="text-xs text-gray-500 mt-1">Current: {formData.difficultyLevel}</div>
                        </div>

                        <div className="md:col-span-2 border-t pt-4">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center">
                                <Settings className="w-4 h-4 mr-2 text-blue-500" />
                                Sensory Preferences
                            </h3>
                            <div className="flex space-x-8">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`p-2 rounded-full transition ${formData.lowStimulation ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Low Stimulation Mode</span>
                                        <input
                                            type="checkbox"
                                            className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={formData.lowStimulation}
                                            onChange={(e) => setFormData({ ...formData, lowStimulation: e.target.checked })}
                                        />
                                    </div>
                                </label>

                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`p-2 rounded-full transition ${formData.soundEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {formData.soundEnabled ? <Headphones className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Sound Enabled</span>
                                        <input
                                            type="checkbox"
                                            className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={formData.soundEnabled}
                                            onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition"
                            >
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {children.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500">No children profiles found. Add one to get started!</p>
                    </div>
                ) : (
                    children.map((child) => (
                        <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                                        {child.name.charAt(0)}
                                    </div>
                                    <div className="flex space-x-2">
                                        {child.sensoryPreferences?.lowStimulation && (
                                            <span title="Low Stimulation Active" className="p-1 bg-yellow-100 text-yellow-600 rounded-md">
                                                <Eye className="w-4 h-4" />
                                            </span>
                                        )}
                                        {!child.sensoryPreferences?.soundEnabled && (
                                            <span title="Sound Muted" className="p-1 bg-red-100 text-red-600 rounded-md">
                                                <VolumeX className="w-4 h-4" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{child.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{child.age} years old • Level {child.difficultyLevel}</p>

                                <div className="border-t pt-4 flex justify-between">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                        Assigned Lessons
                                    </button>
                                    <Link
                                        to={`/progress/${child.id}`}
                                        className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                                    >
                                        <Activity className="w-4 h-4 mr-1" />
                                        View Progress
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-blue-600 h-1.5 w-full opacity-0 group-hover:opacity-100 transition"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);
};

export default ChildProfiles;
