import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Award, Smile, Map } from 'lucide-react';
import RewardGallery from '../components/rewards/RewardGallery';
import api from '../api/axios';

const StudentDashboard = () => {
    const { activeChild } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (activeChild) {
            api.get(`/children/${activeChild.id}/courses`)
                .then(res => setCourses(res.data))
                .catch(err => console.error(err));
        }
    }, [activeChild]);

    if (!activeChild) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-x-hidden relative">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse transform translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto py-12 px-6 sm:px-8 relative z-10">
                <header className="mb-16 text-center animate-fade-in">
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight drop-shadow-sm">
                        Hi, {activeChild.name}! 👋
                    </h1>
                    <p className="text-2xl text-slate-600 font-medium">What would you like to do today?</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
                    
                    {courses.map((course, idx) => (
                        <div 
                            key={course.id}
                            onClick={() => navigate(`/map/${course.id}`)}
                            className="group rounded-[2rem] bg-white p-8 shadow-xl shadow-indigo-100 hover:shadow-2xl hover:shadow-indigo-200 transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-indigo-200 relative overflow-hidden cursor-pointer flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl leading-none pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform">
                                🗺️
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                    <Map className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">{course.title}</h2>
                                <p className="text-slate-500 font-medium">Embark on this adventure!</p>
                            </div>
                        </div>
                    ))}

                    {/* Learn & Play Card */}
                    <Link to="/lessons" className="group rounded-[2rem] bg-white p-8 shadow-xl shadow-indigo-100 hover:shadow-2xl hover:shadow-indigo-200 transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-indigo-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl leading-none pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform">
                            📚
                        </div>
                        <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">My Lessons</h2>
                        <p className="text-slate-500 text-lg">Play games and learn new things!</p>
                    </Link>

                    {/* Feelings Card */}
                    <Link to="/emotions" className="group rounded-[2rem] bg-white p-8 shadow-xl shadow-yellow-100 hover:shadow-2xl hover:shadow-yellow-200 transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-yellow-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl leading-none pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform">
                            😊
                        </div>
                        <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                            <Smile className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Feelings Game</h2>
                        <p className="text-slate-500 text-lg">Learn about emotions & earn stars!</p>
                    </Link>

                </div>

                {/* My Rewards Section */}
                <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-white/50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800">My Rewards Cupboard</h2>
                    </div>
                    <RewardGallery childId={activeChild.id} />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
