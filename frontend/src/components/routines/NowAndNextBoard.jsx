import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ArrowRight, Star, Clock, Image as ImageIcon, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const NowAndNextBoard = ({ childId }) => {
    const [routines, setRoutines] = useState([]);
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!childId) return;

        api.get(`/routines/child/${childId}`)
            .then(res => {
                const allRoutines = res.data;
                allRoutines.forEach(r => {
                    if (r.steps) r.steps.sort((a, b) => a.orderIndex - b.orderIndex);
                });
                setRoutines(allRoutines);
                // Auto-select the first active one (but don't force expand)
                const active = allRoutines.find(r => r.isActive) || (allRoutines.length > 0 ? allRoutines[0] : null);
                setSelectedRoutine(active);
            })
            .catch(err => console.error("Error fetching routine:", err))
            .finally(() => setLoading(false));
    }, [childId]);

    const handleSelectRoutine = (routine) => {
        setSelectedRoutine(routine);
        setCurrentStepIndex(0);
        setIsExpanded(true);
    };

    if (loading) return (
        <div className="w-full bg-white/60 backdrop-blur-xl rounded-[3rem] p-10 shadow-lg border border-white/50 animate-pulse text-center space-y-4 mb-16">
            <div className="h-8 bg-slate-200 rounded-full w-48 mx-auto"></div>
            <div className="h-32 bg-slate-200 rounded-2xl w-full max-w-2xl mx-auto"></div>
        </div>
    );

    if (routines.length === 0) return null;

    const nowStep = selectedRoutine?.steps?.[currentStepIndex];
    const nextStep = selectedRoutine?.steps?.[currentStepIndex + 1];

    return (
        <div className="w-full max-w-4xl mx-auto mb-16 relative">
            {/* Header with toggle */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between mb-6 pl-4 pr-4 py-3 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/80 hover:bg-white/90 transition group"
            >
                <div className="flex items-center">
                    <Calendar className="w-7 h-7 mr-3 text-indigo-500" />
                    <h2 className="text-2xl font-extrabold text-slate-800">My Timelines</h2>
                    <span className="ml-3 text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">{routines.length} routine{routines.length !== 1 ? 's' : ''}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
            </button>

            {isExpanded && (
                <>
                    {/* Routine Tabs (when multiple) */}
                    {routines.length > 1 && (
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 pl-4">
                            {routines.map(r => (
                                <button
                                    key={r.id}
                                    onClick={() => handleSelectRoutine(r)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                        selectedRoutine?.id === r.id
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'
                                    }`}
                                >
                                    {r.title}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Now & Next Board */}
                    {selectedRoutine && nowStep && (
                        <>
                            <div className="flex items-center justify-between mb-4 px-4">
                                <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm">{selectedRoutine.title}</p>
                                <div className="text-sm font-bold text-slate-400 bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                                    Step {currentStepIndex + 1} of {selectedRoutine.steps.length}
                                </div>
                            </div>

                            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-12 shadow-2xl border-4 border-white/80 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-stretch relative overflow-hidden text-center">
                                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-y-1/2"></div>
                                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-y-1/2"></div>

                                {/* NOW */}
                                <div className="flex flex-col items-center relative z-10 group">
                                    <span className="text-3xl font-black text-emerald-500 tracking-widest bg-emerald-50 px-8 py-2 rounded-2xl shadow-sm mb-6 uppercase border-2 border-emerald-100">Now</span>
                                    <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-emerald-400 w-full flex-1 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                                        {nowStep.imageUrl ? (
                                            <img src={nowStep.imageUrl} alt={nowStep.title} className="w-32 h-32 object-contain mb-6 drop-shadow-md" />
                                        ) : (
                                            <ImageIcon className="w-24 h-24 text-emerald-200 mb-6" />
                                        )}
                                        <h3 className="text-3xl font-extrabold text-slate-800 leading-tight mb-2">{nowStep.title}</h3>
                                        {nowStep.durationMinutes && (
                                            <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl mt-2">
                                                <Clock className="w-5 h-5 mr-2" /> {nowStep.durationMinutes} Minutes
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ARROW */}
                                <div className="flex items-center justify-center relative z-10 py-4 md:py-0">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shadow-inner border border-slate-200 text-slate-400">
                                        <ArrowRight className="w-8 h-8 md:rotate-0 rotate-90" />
                                    </div>
                                </div>

                                {/* NEXT */}
                                <div className="flex flex-col items-center relative z-10 group">
                                    <span className="text-3xl font-black text-amber-500 tracking-widest bg-amber-50 px-8 py-2 rounded-2xl shadow-sm mb-6 uppercase border-2 border-amber-100">Next</span>
                                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border-4 border-amber-200 w-full flex-1 flex flex-col items-center justify-center opacity-80 group-hover:opacity-100 transform group-hover:scale-105 transition-all duration-300">
                                        {nextStep ? (
                                            <>
                                                {nextStep.imageUrl ? (
                                                    <img src={nextStep.imageUrl} alt={nextStep.title} className="w-24 h-24 object-contain mb-6 opacity-70 drop-shadow-sm" />
                                                ) : (
                                                    <ImageIcon className="w-20 h-20 text-amber-200 mb-6" />
                                                )}
                                                <h3 className="text-2xl font-bold text-slate-600 leading-tight">{nextStep.title}</h3>
                                            </>
                                        ) : (
                                            <>
                                                <Star className="w-24 h-24 text-amber-300 fill-amber-100 mb-6 animate-pulse" />
                                                <h3 className="text-2xl font-extrabold text-amber-500">All Done!</h3>
                                                <p className="text-amber-600/80 font-medium">Free Time</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Complete Button */}
                            <div className="flex justify-center mt-10">
                                <button 
                                    onClick={() => setCurrentStepIndex(prev => prev + 1)}
                                    className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-2xl tracking-wider rounded-2xl shadow-[0_10px_0_rgb(4,120,87)] hover:shadow-[0_5px_0_rgb(4,120,87)] hover:translate-y-1 transition-all flex items-center group border-4 border-white"
                                >
                                    I FINISHED THIS <ArrowRight className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Finished all steps message */}
                    {selectedRoutine && !nowStep && (
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border-4 border-white/80 text-center">
                            <Star className="w-20 h-20 text-amber-400 fill-amber-100 mx-auto mb-4 animate-bounce" />
                            <h3 className="text-3xl font-extrabold text-slate-800 mb-2">All Steps Complete! 🎉</h3>
                            <p className="text-slate-500 font-medium text-lg">Great job finishing "{selectedRoutine.title}"!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NowAndNextBoard;
