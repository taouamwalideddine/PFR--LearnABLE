import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const MultipleChoice = ({ activity, onComplete }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Expected content structure:
    // content: { question: "What is 2+2?", options: ["3", "4", "5"], correctAnswer: "4" }

    const handleSelect = (option) => {
        if (showFeedback) return;

        setSelectedOption(option);
        const correct = option === activity.content.correctAnswer;
        setIsCorrect(correct);
        setShowFeedback(true);

        setTimeout(() => {
            onComplete(correct);
        }, 2000);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center text-balance">
                {activity.content.question}
            </h2>

            <div className="space-y-4">
                {activity.content.options.map((option, index) => {
                    let buttonClass = "w-full text-left px-6 py-4 rounded-xl border-2 transition-all text-lg font-medium ";

                    if (!showFeedback) {
                        buttonClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
                    } else {
                        if (option === activity.content.correctAnswer) {
                            buttonClass += "border-green-500 bg-green-50 text-green-700 relative";
                        } else if (option === selectedOption && option !== activity.content.correctAnswer) {
                            buttonClass += "border-red-500 bg-red-50 text-red-700 relative";
                        } else {
                            buttonClass += "border-gray-200 opacity-50 text-gray-500";
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(option)}
                            disabled={showFeedback}
                            className={buttonClass}
                        >
                            {option}

                            {showFeedback && option === activity.content.correctAnswer && (
                                <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                            )}
                            {showFeedback && option === selectedOption && option !== activity.content.correctAnswer && (
                                <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-red-500" />
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
