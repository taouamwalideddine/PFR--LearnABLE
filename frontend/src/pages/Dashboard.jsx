import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, GraduationCap, Trophy, Smile } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [childCount, setChildCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await api.get('/children');
                setChildCount(response.data.length);
            } catch (error) {
                console.error('Error fetching child count:', error);
            }
        };
        fetchCount();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <header className="mb-12 animate-fade-in">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2">
                    Welcome back, {user?.email} 👋
                </h1>
                <p className="text-lg text-slate-500 font-medium">Here is what is happening today.</p>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Children Card */}
                <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">My Children</h3>
                        <p className="text-3xl font-extrabold text-slate-800 mb-6">{childCount} Profiles</p>
                        <Link to="/children" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            Manage Profiles <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>

                {/* Emotions Card */}
                <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(234,179,8,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-200">
                            <Smile className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Specialized</h3>
                        <p className="text-2xl font-extrabold text-slate-800 mb-6 leading-tight">Emotions<br/>Learning</p>
                        <Link to="/emotions" className="inline-flex items-center text-sm font-bold text-yellow-600 hover:text-yellow-800 transition-colors">
                            Launch Module <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>

                {/* Lessons Card */}
                <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(34,197,94,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Curriculum</h3>
                        <p className="text-2xl font-extrabold text-slate-800 mb-6 leading-tight">Standard<br/>Lessons</p>
                        <Link to="/lessons" className="inline-flex items-center text-sm font-bold text-green-600 hover:text-green-800 transition-colors">
                            Explore Catalog <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>

                {/* Progress Card */}
                <div className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_8px_30px_rgb(168,85,247,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                            <Trophy className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Analytics</h3>
                        <p className="text-2xl font-extrabold text-slate-800 mb-6 leading-tight">Recent<br/>Progress</p>
                        <Link to="/children" className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors">
                            View Reports <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
