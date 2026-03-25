import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    GraduationCap, 
    Smile, 
    MessageSquare,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
    const { user, activeChild, logout, switchChild } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Don't show sidebar on login/register pages
    if (['/login', '/register'].includes(location.pathname)) return null;

    // If a child is actively playing, they get a completely different full-screen UI, so hide this sidebar.
    if (activeChild) {
        return (
            <div className="fixed top-4 right-4 z-50">
                <button 
                    onClick={() => switchChild(null)}
                    className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-md text-slate-800 font-bold rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-all hover:scale-105"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Exit Student Mode
                </button>
            </div>
        );
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Children', href: '/children', icon: Users, hidden: user?.role === 'EDUCATEUR' || user?.role === 'ENFANT' },
        { name: 'Curriculum', href: '/curriculum', icon: GraduationCap, hidden: user?.role === 'ENFANT' },
        { name: 'Emotions Demo', href: '/emotions', icon: Smile },
        // { name: 'Community Forum', href: '/forum', icon: MessageSquare }, // Coming soon
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-md text-slate-800"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Overlay for Mobile */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Main Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                flex flex-col z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8">
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-lg shadow-indigo-200">
                            <span className="text-white font-bold text-xl">L</span>
                        </div>
                        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-500">
                            LearnAble
                        </span>
                    </Link>
                </div>

                <div className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {user && (
                        <div className="px-4 pb-6 mb-6 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                            <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                {user.role}
                            </span>
                        </div>
                    )}

                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            if (item.hidden) return null;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group
                                        ${active 
                                            ? 'bg-indigo-50 text-indigo-700 font-bold' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-medium group"
                    >
                        <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
