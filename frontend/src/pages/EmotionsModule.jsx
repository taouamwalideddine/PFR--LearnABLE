import React, { useState } from 'react';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmotionGame from '../components/activities/EmotionGame';

// Sample data for emotions - later this could come from the backend/database
const EMOTIONS_DATA = [
    // ... existing data ...
    {
        id: 1,
        emotion: 'Happy',
        frenchName: 'Joyeux',
        description: 'When something good happens and makes you smile.',
        color: 'bg-yellow-100',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-700',
        emoji: '😊',
        scenarios: [
            'Playing with your favorite toy',
            'Eating your favorite dessert',
            'Getting a hug from mom or dad'
        ]
    },
    {
        id: 2,
        emotion: 'Sad',
        frenchName: 'Triste',
        description: 'When things don\'t go well and you feel like crying.',
        color: 'bg-blue-100',
        borderColor: 'border-blue-400',
        textColor: 'text-blue-700',
        emoji: '😢',
        scenarios: [
            'Losing a toy',
            'Saying goodbye to a friend',
            'When it rains and you can\'t go out'
        ]
    },
    {
        id: 3,
        emotion: 'Angry',
        frenchName: 'En Colère',
        description: 'When something feels unfair or frustrating.',
        color: 'bg-red-100',
        borderColor: 'border-red-400',
        textColor: 'text-red-700',
        emoji: '😡',
        scenarios: [
            'Someone takes your toy',
            'Building blocks fall down',
            'Being told "no"'
        ]
    },
    {
        id: 4,
        emotion: 'Scared',
        frenchName: 'Effrayé',
        description: 'When something feels dangerous or surprising.',
        color: 'bg-purple-100',
        borderColor: 'border-purple-400',
        textColor: 'text-purple-700',
        emoji: '😨',
        scenarios: [
            'Hearing a loud noise',
            'Being in the dark',
            'Seeing a scary dog'
        ]
    }
];

const EmotionsModule = () => {
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [view, setView] = useState('gallery'); // 'gallery' | 'detail' | 'game'

    const handleSelectEmotion = (emotion) => {
        setSelectedEmotion(emotion);
        setView('detail');
    };

    if (view === 'game') {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <button
                    onClick={() => setView('gallery')}
                    className="flex items-center text-gray-500 hover:text-gray-800 mb-6 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Selection
                </button>
                <EmotionGame emotionsData={EMOTIONS_DATA} onBack={() => setView('gallery')} />
            </div>
        );
    }

    if (view === 'detail' && selectedEmotion) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <button
                    onClick={() => setView('gallery')}
                    className="flex items-center text-gray-500 hover:text-gray-800 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Gallery
                </button>

                <div className={`rounded-3xl p-8 border-4 ${selectedEmotion.borderColor} ${selectedEmotion.color} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-[150px] leading-none pointer-events-none transform rotate-12">
                        {selectedEmotion.emoji}
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="text-8xl filter drop-shadow-md">
                                {selectedEmotion.emoji}
                            </div>
                            <div>
                                <h1 className={`text-4xl sm:text-5xl font-extrabold ${selectedEmotion.textColor} mb-2`}>
                                    {selectedEmotion.emotion}
                                </h1>
                                <p className={`text-xl font-medium opacity-80 ${selectedEmotion.textColor}`}>
                                    {selectedEmotion.frenchName}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">What does it mean?</h3>
                            <p className="text-gray-700 text-lg leading-relaxed">{selectedEmotion.description}</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">When might I feel this way?</h3>
                            <ul className="space-y-3">
                                {selectedEmotion.scenarios.map((scenario, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className={`inline-block border-2 ${selectedEmotion.borderColor} rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-bold ${selectedEmotion.textColor}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="text-gray-700 text-lg">{scenario}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Learning Emotions 🎭</h1>
                    <p className="text-lg text-gray-600">Let's learn how to identify our feelings and understand others.</p>
                </div>
                <button
                    onClick={() => setView('game')}
                    className="hidden sm:flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition transform hover:scale-105 shadow-md"
                >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Play Emotion Game
                </button>
            </div>

            <button
                onClick={() => setView('game')}
                className="w-full sm:hidden flex justify-center items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md mb-8"
            >
                <PlayCircle className="w-5 h-5 mr-2" />
                Play Emotion Game
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {EMOTIONS_DATA.map((emotion) => (
                    <button
                        key={emotion.id}
                        onClick={() => handleSelectEmotion(emotion)}
                        className={`flex flex-col items-center justify-center p-8 rounded-3xl border-4 ${emotion.borderColor} ${emotion.color} hover:shadow-xl transition-all transform hover:-translate-y-2 group text-left w-full relative overflow-hidden`}
                    >
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10 filter drop-shadow-sm">
                            {emotion.emoji}
                        </div>
                        <h2 className={`text-2xl font-bold ${emotion.textColor} relative z-10`}>
                            {emotion.emotion}
                        </h2>
                        <span className={`text-sm font-medium opacity-70 mt-1 ${emotion.textColor} relative z-10`}>
                            {emotion.frenchName}
                        </span>

                        {/* Decorative background circle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/30 rounded-full blur-2xl group-hover:bg-white/40 transition-colors pointer-events-none"></div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmotionsModule;
