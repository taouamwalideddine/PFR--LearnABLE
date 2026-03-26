import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Plus, Clock, Image as ImageIcon, Trash2, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoutineList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchRoutines(selectedChild);
        } else {
            setRoutines([]);
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            const res = await api.get('/children');
            setChildren(res.data);
            if (res.data.length > 0) setSelectedChild(res.data[0].id);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRoutines = async (childId) => {
        try {
            setLoading(true);
            const res = await api.get(`/routines/child/${childId}`);
            setRoutines(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoutine = async (e) => {
        e.preventDefault();
        try {
            await api.post('/routines', {
                title,
                description,
                childId: selectedChild,
                isActive: true
            });
            setShowRoutineModal(false);
            setTitle('');
            setDescription('');
            fetchRoutines(selectedChild);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteRoutine = async (id) => {
        if (!window.confirm("Delete this entire schedule?")) return;
        try {
            await api.delete(`/routines/${id}`);
            fetchRoutines(selectedChild);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading && children.length === 0) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight flex items-center mb-4">
                        <Calendar className="w-12 h-12 mr-4 text-indigo-600" />
                        Routine Builder
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-2xl">
                        Create visual timelines for the "Now & Next" board. Structural predictability reduces transition anxiety.
                    </p>
                </div>
                
                {children.length > 0 && (
                    <button 
                        onClick={() => setShowRoutineModal(true)}
                        className="flex items-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-indigo-700 transition-all font-medium whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Routine
                    </button>
                )}
            </div>

            {children.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Profiles Found</h3>
                    <p className="text-slate-500 mb-6">You need to create a child profile first.</p>
                    <button onClick={() => navigate('/children')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md">Create Profile</button>
                </div>
            ) : (
                <>
                    <div className="mb-10 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 max-w-md">
                        <span className="font-bold text-slate-700">Managing Schedule For:</span>
                        <select 
                            value={selectedChild} 
                            onChange={(e) => setSelectedChild(e.target.value)}
                            className="bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold rounded-xl px-4 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 flex-1"
                        >
                            {children.map(child => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-pulse flex space-x-4"><div className="h-12 w-12 bg-slate-200 rounded-xl"></div><div className="h-12 w-48 bg-slate-200 rounded-xl"></div></div></div>
                    ) : routines.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                            <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700 mb-2">No Routines Configured</h3>
                            <p className="text-slate-500">Create a daily schedule like "Bedtime Routine" or "School Morning".</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {routines.map(routine => (
                                <div key={routine.id} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden group">
                                    <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex justify-between items-start">
                                        <div>
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-xl text-xs font-black uppercase tracking-wider mb-4 inline-block">
                                                {routine.category}
                                            </span>
                                            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{routine.title}</h2>
                                            {routine.description && <p className="text-slate-500 font-medium">{routine.description}</p>}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteRoutine(routine.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-8 bg-slate-50/50">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-slate-700">Timeline Sequence</h3>
                                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                                                {routine.steps?.length || 0} Steps
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3 mb-6 relative">
                                            {/* Timeline connecting line */}
                                            {routine.steps?.length > 1 && (
                                                <div className="absolute left-[1.15rem] top-6 bottom-6 w-0.5 bg-indigo-100"></div>
                                            )}

                                            {routine.steps?.map((step, idx) => (
                                                <div key={step.id} className="flex flex-col relative z-10">
                                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800">{step.title}</h4>
                                                                {step.durationMinutes && <span className="text-xs font-bold text-slate-400">{step.durationMinutes} min</span>}
                                                            </div>
                                                        </div>
                                                        {step.imageUrl && <ImageIcon className="w-5 h-5 text-slate-300" />}
                                                    </div>
                                                    {/* Next arrow visually except for last element */}
                                                    {idx < routine.steps.length - 1 && (
                                                        <div className="flex justify-center -my-3 z-10">
                                                            <div className="bg-slate-50 p-1 rounded-full text-indigo-300">
                                                                <ArrowRight className="w-4 h-4 rotate-90" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {(!routine.steps || routine.steps.length === 0) && (
                                                <div className="text-center py-6 text-slate-400 font-medium text-sm">
                                                    Empty timeline. Click Edit to add visual steps.
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => navigate(`/routines/${routine.id}`)}
                                            className="w-full py-3.5 bg-white border-2 border-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center justify-center"
                                        >
                                            Manage Timeline Steps <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modal for adding Routine */}
            {showRoutineModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-bounce-in overflow-hidden">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h2 className="text-2xl font-extrabold text-slate-800">Draft New Schedule</h2>
                            <button onClick={() => setShowRoutineModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRoutine} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Routine Category / Name</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800"
                                    placeholder="e.g. Bedtime Routine"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 min-h-[100px]"
                                    placeholder="Brief outline of the timezone."
                                ></textarea>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowRoutineModal(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all">Create Skeleton</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutineList;
