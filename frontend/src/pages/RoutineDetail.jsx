import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Plus, Clock, Image as ImageIcon, Trash2, Calendar, Edit2, X, MoveUp, MoveDown } from 'lucide-react';

const RoutineDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showStepModal, setShowStepModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');

    useEffect(() => {
        fetchRoutine();
    }, [id]);

    const fetchRoutine = async () => {
        try {
            // fetch routines
            setLoading(true);
            const res = await api.get(`/routines/${id}`);
            // sort steps
            if (res.data.steps) {
                res.data.steps.sort((a, b) => a.orderIndex - b.orderIndex);
            }
            setRoutine(res.data);
        } catch (error) {
            console.error('Error fetching routine:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStep = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/routines/${id}/steps`, {
                title,
                description,
                imageUrl,
                durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
                orderIndex: routine.steps?.length || 0,
            });
            setShowStepModal(false);
            setTitle('');
            setDescription('');
            setImageUrl('');
            setDurationMinutes('');
            fetchRoutine();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteStep = async (stepId) => {
        if (!window.confirm("Remove this step from the timeline?")) return;
        try {
            await api.delete(`/routines/steps/${stepId}`);
            fetchRoutine();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;
    if (!routine) return <div className="p-10 text-center">Routine not found.</div>;

    return (
        <div className="p-10 max-w-5xl mx-auto min-h-screen">
            <button 
                onClick={() => navigate('/routines')}
                className="flex items-center text-slate-500 font-bold hover:text-indigo-600 transition-colors mb-8"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Schedules
            </button>

            <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-slate-100 flex justify-between items-start mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-10 opacity-70"></div>
                <div className="max-w-xl">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-xl text-xs font-black uppercase tracking-wider mb-4 inline-block">
                        Routine • {routine.category}
                    </span>
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-4">{routine.title}</h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        {routine.description || "Design the visual sequence for your child's Now & Next board."}
                    </p>
                </div>
                <div>
                    <button 
                        onClick={() => setShowStepModal(true)}
                        className="flex text-lg items-center justify-center px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Add Step
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-indigo-500" />
                    Timeline Sequence
                </h2>

                <div className="space-y-4 relative">
                    {/* Visual Line */}
                    {routine.steps?.length > 1 && (
                        <div className="absolute left-8 top-10 bottom-10 w-1 bg-slate-100 rounded-full z-0"></div>
                    )}

                    {(!routine.steps || routine.steps.length === 0) ? (
                        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl relative z-10">
                            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">Empty Timeline</h3>
                            <p className="text-slate-500">Add the first visual step to this routine.</p>
                        </div>
                    ) : (
                        routine.steps.map((step, idx) => (
                            <div key={step.id} className="relative z-10 flex items-center group">
                                <div className="w-16 h-16 bg-white border-4 border-indigo-100 rounded-full flex items-center justify-center font-extrabold text-xl font-mono text-indigo-600 mr-6 shadow-sm flex-shrink-0 group-hover:border-indigo-300 transition-colors">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group-hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        {step.imageUrl ? (
                                            <div className="w-16 h-16 bg-slate-100 rounded-xl mr-6 flex-shrink-0 bg-cover bg-center border border-slate-200" style={{ backgroundImage: `url(${step.imageUrl})` }}></div>
                                        ) : (
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl mr-6 flex-shrink-0 border border-slate-100 flex items-center justify-center text-slate-300">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                                            <div className="flex items-center mt-2 text-sm font-bold text-slate-400">
                                                {step.durationMinutes ? (
                                                    <span className="flex items-center bg-slate-100 px-3 py-1 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5 mr-1" /> {step.durationMinutes} min
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-50 px-3 py-1 rounded-lg">No time limit</span>
                                                )}
                                                {step.description && <span className="ml-3 text-slate-500 font-medium">{step.description}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">
                                            <MoveUp className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">
                                            <MoveDown className="w-5 h-5" />
                                        </button>
                                        <div className="w-px h-8 bg-slate-200 mx-2"></div>
                                        <button 
                                            onClick={() => handleDeleteStep(step.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal for adding Step */}
            {showStepModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-bounce-in overflow-hidden">
                        <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h2 className="text-2xl font-extrabold text-slate-800">New Timeline Step</h2>
                            <button onClick={() => setShowStepModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddStep} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Step Name</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800"
                                    placeholder="e.g. Brush Teeth"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Visual Image URL (Optional but Recommended)</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800"
                                    placeholder="https://example.com/toothbrush.png"
                                />
                                <p className="text-xs text-slate-500 mt-2 font-medium">Visuals are crucial for the autistic brain to process expectations.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Minutes, Optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowStepModal(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all">Add Step</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutineDetail;
