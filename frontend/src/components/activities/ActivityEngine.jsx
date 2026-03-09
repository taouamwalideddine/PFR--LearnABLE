import React, { useState } from 'react';
import api from '../api/axios';
import MultipleChoice from './MultipleChoice';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle } from 'lucide-react';

const ActivityEngine = ({ activity, childId, onFinished }) => {
    const [hasStarted, setHasStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const startTimeRef = React.useRef(null);

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
            onFinished(isCorrect);
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

    // Render the appropriate activity component based on type
    switch (activity.type) {
        case 'CHOIX_MULTIPLE':
            return <MultipleChoice activity={activity} onComplete={handleComplete} />;
        // Other cases like 'ASSOCIATION' would go here
        default:
            return <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">Activity type not supported yet. ({activity.type})</div>;
    }
};

export default ActivityEngine;
