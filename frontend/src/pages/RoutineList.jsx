import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Plus, Clock, Image as ImageIcon, Trash2, ArrowRight, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoutineList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [children, setChildren] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [assigningRoutineId, setAssigningRoutineId] = useState(null);
    const [assignToChildId, setAssignToChildId] = useState('');

    useEffect(() => {
        fetchChildren();
        fetchRoutines();
    }, []);

    const fetchChildren = async () => {
        try {
            const res = await api.get('/children');
            setChildren(res.data);
            if (res.data.length > 0) setAssignToChildId(res.data[0].id);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRoutines = async () => {
        try {
            setLoading(true);
            const res = await api.get('/routines');
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
                isActive: true
            });
            setShowRoutineModal(false);
            setTitle('');
            setDescription('');
            fetchRoutines();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteRoutine = async (id) => {
        if (!window.confirm("Delete this entire schedule template?")) return;
        try {
            await api.delete(`/routines/${id}`);
            fetchRoutines();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignToChildId || !assigningRoutineId) return;
        try {
            await api.post(`/routines/${assigningRoutineId}/assign`, { childId: assignToChildId });
            setAssigningRoutineId(null);
            fetchRoutines(); // Refresh to see assignments
        } catch (err) {
            console.error(err);
            alert("Failed to assign. Maybe they already have it?");
        }
    };

    if (loading && children.length === 0) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight flex items-center mb-4">
                        <Calendar className="w-12 h-12 mr-4 text-indigo-600" />
                        Timelines & Routines
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-2xl">
                        Create visual master timelines and assign them to your students' "Now & Next" boards. Build it once, assign it many times.
                    </p>
                </div>
                
                <button 
                    onClick={() => setShowRoutineModal(true)}
                    className="flex items-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-indigo-700 transition-all font-medium whitespace-nowrap"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Timeline
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-pulse flex space-x-4"><div className="h-12 w-12 bg-slate-200 rounded-xl"></div><div className="h-12 w-48 bg-slate-200 rounded-xl"></div></div></div>
            ) : routines.length === 0 ? (
                <div className="text-center py-20 bg-white shadow-sm border border-slate-100 rounded-3xl">
                    <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">No Timelines Configured</h3>
                    <p className="text-slate-500 mb-6 font-medium">Create a visual schedule like "Bedtime Routine" or "School Morning".</p>
                    <button onClick={() => setShowRoutineModal(true)} className="px-6 py-3 bg-indigo-100 text-indigo-700 font-bold rounded-xl shadow-sm hover:bg-indigo-200">Start Building</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {routines.map(routine => (
                        <div key={routine.id} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col group">
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
                                    title="Delete Timeline entirely"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* ASSIGNMENT ZONE */}
                            <div className="px-8 py-5 bg-white border-b border-slate-100 flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center">
                                    <Users className="w-4 h-4 mr-1 pb-0.5" /> Assigned:
                                </span>
                                {routine.children?.length > 0 ? (
                                    routine.children.map(c => (
                                         <span key={c.id} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                                            {c.name}
                                         </span>
                                    ))
                                ) : (
                                    <span className="text-slate-400 text-sm italic font-medium">Unassigned</span>
                                )}
                                <div className="flex-1"></div>
                                <button 
                                    onClick={() => setAssigningRoutineId(routine.id)}
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                                >
                                    + Assign Child
                                </button>
                            </div>

                            <div className="p-8 bg-slate-50 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-700">Timeline Components</h3>
                                    </div>
                                    <div className="flex gap-2 flex-wrap mb-6">
                                        {!routine.steps || routine.steps.length === 0 ? (
                                            <span className="text-sm text-slate-400 font-medium italic">Empty timeline. Click below to add steps.</span>
                                        ) : (
                                            routine.steps.map((step, idx) => (
                                                <div key={step.id} className="flex items-center text-sm font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
                                                    <span className="text-indigo-400 mr-2">{idx+1}.</span>
                                                    {step.title}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/routines/${routine.id}`)}
                                    className="w-full mt-4 py-3.5 bg-white border-2 border-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center justify-center shadow-sm"
                                >
                                    Build/Edit Timeline Steps <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for creating a Routine */}
            {showRoutineModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-bounce-in overflow-hidden">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h2 className="text-2xl font-extrabold text-slate-800">Draft New master Timeline</h2>
                            <button onClick={() => setShowRoutineModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRoutine} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Timeline Name</label>
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
                                    placeholder="Brief outline of the timeline."
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

            {/* Modal for Assigning a Routine */}
            {assigningRoutineId && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-bounce-in overflow-hidden">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h2 className="text-2xl font-extrabold text-slate-800">Assign to Child</h2>
                            <button onClick={() => setAssigningRoutineId(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAssign} className="p-8 space-y-6">
                            {children.length === 0 ? (
                                <p className="text-slate-500 font-medium">You don't have any children profiles yet.</p>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Child Profile</label>
                                    <select
                                        value={assignToChildId}
                                        onChange={(e) => setAssignToChildId(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                        required
                                    >
                                        <option value="" disabled>Select a child...</option>
                                        {children.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setAssigningRoutineId(null)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button type="submit" disabled={children.length === 0} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none">Confirm Assignment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default RoutineList;
