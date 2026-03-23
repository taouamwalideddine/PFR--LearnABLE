import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const EMOTIONS = [
    { id: 'HAPPY', emoji: '😊', label: 'Happy' },
    { id: 'SAD', emoji: '😢', label: 'Sad' },
    { id: 'ANGRY', emoji: '😠', label: 'Angry' },
    { id: 'FEAR', emoji: '😨', label: 'Scared' },
    { id: 'SURPRISE', emoji: '😲', label: 'Surprised' },
    { id: 'DISGUST', emoji: '🤢', label: 'Disgusted' }
];

const EmotionRecognition = ({ activity, onComplete }) => {
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [options, setOptions] = useState([]);

    const targetEmotionId = activity.content.targetEmotion;

    useEffect(() => {
        // Generate options: The correct one + 3 random ones
        const correctEmotion = EMOTIONS.find(e => e.id === targetEmotionId) || EMOTIONS[0];
        
        const otherEmotions = EMOTIONS.filter(e => e.id !== targetEmotionId);
        const shuffledOthers = otherEmotions.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        const finalOptions = [correctEmotion, ...shuffledOthers].sort(() => 0.5 - Math.random());
        setOptions(finalOptions);
    }, [targetEmotionId]);

    const handleSelect = (emotionId) => {
        if (showFeedback) return;

        setSelectedEmotion(emotionId);
        const correct = emotionId === targetEmotionId;
        setIsCorrect(correct);
        setShowFeedback(true);

        setTimeout(() => {
            onComplete(correct);
        }, 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-100 rounded-3xl shadow-xl border border-slate-200 p-10 animate-fade-in text-center">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-4 leading-tight">
                {activity.content.prompt || "How does this person feel?"}
            </h2>
            <p className="text-lg text-slate-500 mb-10">Click on the face that shows the right emotion!</p>

            <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                {options.map((emotion) => {
                    let btnClass = "relative flex flex-col items-center justify-center p-8 rounded-3xl border-[3px] transition-all transform ";

                    if (!showFeedback) {
                        btnClass += "border-slate-300 bg-white hover:border-indigo-400 hover:scale-[1.03] hover:shadow-lg hover:bg-slate-50 cursor-pointer";
                    } else {
                        if (emotion.id === targetEmotionId) {
                            btnClass += "border-emerald-500 bg-emerald-100 scale-[1.05] shadow-xl z-10";
                        } else if (emotion.id === selectedEmotion && emotion.id !== targetEmotionId) {
                            btnClass += "border-red-500 bg-red-100 scale-95 opacity-80";
                        } else {
                            btnClass += "border-slate-200 bg-slate-50 opacity-40 scale-95";
                        }
                    }

                    return (
                        <button
                            key={emotion.id}
                            onClick={() => handleSelect(emotion.id)}
                            disabled={showFeedback}
                            className={btnClass}
                        >
                            <span className="text-[5rem] leading-none mb-3 filter drop-shadow-md group-hover:drop-shadow-xl transition-all">
                                {emotion.emoji}
                            </span>
                            
                            {showFeedback && emotion.id === targetEmotionId && (
                                <div className="absolute top-4 right-4 bg-emerald-500 rounded-full text-white animate-bounce-in shadow-md">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            )}
                            {showFeedback && emotion.id === selectedEmotion && emotion.id !== targetEmotionId && (
                                <div className="absolute top-4 right-4 bg-red-500 rounded-full text-white shadow-md">
                                    <XCircle className="w-8 h-8" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            
            {showFeedback && (
                 <div className={`mt-10 p-5 rounded-2xl text-center font-bold text-xl animate-bounce-in shadow-md ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isCorrect ? 'Awesome! You got it right! 🎉' : 'Keep trying! You will get it next time.'}
                 </div>
            )}
        </div>
    );
};

export default EmotionRecognition;
