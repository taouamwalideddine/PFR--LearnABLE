import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const MultipleChoice = ({ activity, onComplete }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Expected content structure:
    // content: { question: "What is 2+2?", options: ["3", "4", "5"], correctAnswer: "4" }

    const handleSelect = (option, idx) => {
        if (showFeedback) return;

        setSelectedOption(option);
        const correct = idx === activity.content.correctOptionIndex;
        setIsCorrect(correct);
        setShowFeedback(true);

        setTimeout(() => {
            onComplete(correct);
        }, 2000);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-100 rounded-3xl shadow-xl border border-slate-200 p-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center text-balance leading-tight">
                {activity.content.question}
            </h2>

            <div className="space-y-4">
                {activity.content.options.map((option, index) => {
                    let buttonClass = "w-full text-left px-8 py-5 rounded-2xl border-2 transition-all text-xl font-bold flex justify-between items-center ";

                    if (!showFeedback) {
                        buttonClass += "border-slate-300 hover:border-indigo-400 hover:bg-slate-200 text-slate-700 bg-white shadow-sm hover:shadow-md hover:-translate-y-1";
                    } else {
                        if (index === activity.content.correctOptionIndex) {
                            buttonClass += "border-emerald-500 bg-emerald-500 text-white shadow-lg";
                        } else if (option === selectedOption && index !== activity.content.correctOptionIndex) {
                            buttonClass += "border-red-500 bg-red-500 text-white shadow-md";
                        } else {
                            buttonClass += "border-slate-300 opacity-40 text-slate-500 bg-white";
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(option, index)}
                            disabled={showFeedback}
                            className={buttonClass}
                        >
                            <span>{option}</span>

                            {showFeedback && index === activity.content.correctOptionIndex && (
                                <CheckCircle2 className="w-8 h-8 text-white animate-bounce-in" />
                            )}
                            {showFeedback && option === selectedOption && index !== activity.content.correctOptionIndex && (
                                <XCircle className="w-8 h-8 text-white" />
                            )}
                        </button>
                    );
                })}
            </div>

            {showFeedback && (
                <div className={`mt-8 p-4 rounded-xl text-center font-bold text-lg animate-fade-in ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isCorrect ? 'Excellent! That is correct 🎉' : 'Oops! Let\'s try again next time.'}
                </div>
            )}
        </div>
    );
};

export default MultipleChoice;
