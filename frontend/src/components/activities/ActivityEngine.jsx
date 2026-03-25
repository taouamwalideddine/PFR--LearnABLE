import React, { useState } from 'react';
import api from '../../api/axios';
import MultipleChoice from './MultipleChoice';
import EmotionRecognition from './EmotionRecognition';
import DragDrop from './DragDrop';
import InformationCard from './InformationCard';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, Star } from 'lucide-react';

const ActivityEngine = ({ activity, childId, onFinished }) => {
    const [hasStarted, setHasStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const startTimeRef = React.useRef(null);

    React.useEffect(() => {
        setHasStarted(false);
        setIsSubmitting(false);
        setShowCelebration(false);
        startTimeRef.current = null;
    }, [activity?.id]);

    const handleStart = () => {
        setHasStarted(true);
        startTimeRef.current = Date.now();
    };

    const handleComplete = async (isCorrect) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const successRate = isCorrect ? 100 : 0; // Simplified for single-interaction activities

        try {
            await api.post(`/activities/${activity.id}/progress`, {
                childId,
                completed: true,
                successRate,
                timeSpent,
            });

            if (isCorrect) {
                setShowCelebration(true);
            } else {
                onFinished(false);
            }
        } catch (error) {
            console.error('Error submitting progress:', error);
            // Still allow continuation even if logging fails temporarily
            onFinished(isCorrect);
        }
    };

    if (!hasStarted) {
        return (
            <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{activity.title}</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Are you ready to start this activity? Make sure you are in a quiet environment.
                </p>
                <button
                    onClick={handleStart}
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:scale-105 transition transform shadow-lg text-lg"
                >
                    <PlayCircle className="w-6 h-6 mr-2" />
                    Start Now
                </button>
            </div>
        );
    }

    if (showCelebration) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl p-10 flex flex-col items-center max-w-md w-full mx-4 shadow-2xl transform transition-all animate-bounce-in">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <Star className="w-32 h-32 text-yellow-500 fill-yellow-400 relative z-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Amazing Job!</h2>
                    <p className="text-lg text-gray-600 mb-8 text-center">You earned a new <span className="font-bold text-yellow-600">Star Reward</span>!</p>
                    <button
                        onClick={() => onFinished(true)}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition transform hover:scale-105"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    // Render the appropriate activity component based on type
    let activityContent;
    switch (activity.type) {
        case 'CHOIX_MULTIPLE':
        case 'multiple_choice':
            activityContent = <MultipleChoice activity={activity} onComplete={handleComplete} />;
            break;
        case 'emotion_recognition':
            activityContent = <EmotionRecognition activity={activity} onComplete={handleComplete} />;
            break;
        case 'drag_drop':
            activityContent = <DragDrop activity={activity} onComplete={handleComplete} />;
            break;
        case 'information_card':
            activityContent = <InformationCard activity={activity} onComplete={handleComplete} />;
            break;
        default:
            activityContent = (
                <div className="p-8 bg-slate-100 text-slate-800 rounded-2xl flex flex-col items-center">
                    <p className="mb-4">Activity type not supported yet: {activity.type}</p>
                    <button onClick={() => handleComplete(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl">Skip Activity</button>
                </div>
            );
    }

    return (
        <div className="w-full relative">
            {activityContent}
        </div>
    );
};

export default ActivityEngine;
