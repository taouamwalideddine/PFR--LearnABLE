import React, { useState, useEffect } from 'react';
import { Trophy, Star, ArrowRight, RefreshCw, XCircle } from 'lucide-react';

const EmotionGame = ({ emotionsData, onBack }) => {
    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [gameState, setGameState] = useState('playing'); // playing | correct | incorrect | finished
    const [streak, setStreak] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);

    const TOTAL_QUESTIONS = 5;

    // Initialize or load next question
    const generateQuestion = () => {
        if (questionsAnswered >= TOTAL_QUESTIONS) {
            setGameState('finished');
            return;
        }

        // Pick a random emotion as the correct answer
        const correctEmotion = emotionsData[Math.floor(Math.random() * emotionsData.length)];

        // Pick 2 other random emotions as wrong options options
        let wrongOptions = emotionsData.filter(e => e.id !== correctEmotion.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);

        // Combine and shuffle options
        const allOptions = [correctEmotion, ...wrongOptions].sort(() => 0.5 - Math.random());

        // Randomly decide if we are asking to identify the Emoji by Name, or Name by Emoji
        const questionType = Math.random() > 0.5 ? 'findEmoji' : 'findName';

        setCurrentQuestion({
            correct: correctEmotion,
            type: questionType
        });
        setOptions(allOptions);
        setGameState('playing');
    };

    useEffect(() => {
        generateQuestion();
    }, []);

    const handleAnswer = (selectedOption) => {
        if (gameState !== 'playing') return;

        if (selectedOption.id === currentQuestion.correct.id) {
            const pointsEarned = 10 + (streak * 5); // Bonus points for streaks
            setScore(prev => prev + pointsEarned);
            setStreak(prev => prev + 1);
            setGameState('correct');
        } else {
            setStreak(0);
            setGameState('incorrect');
        }
    };

    const handleNext = () => {
        setQuestionsAnswered(prev => prev + 1);
        generateQuestion(); // generateQuestion will handle if finished
    };

    if (!currentQuestion && gameState !== 'finished') return null;

    if (gameState === 'finished') {
        return (
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center shadow-xl max-w-lg w-full mx-auto transform transition-all animate-fade-in border-4 border-yellow-400">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
                    <Trophy className="w-32 h-32 text-yellow-500 relative z-10" />
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Great Job!</h2>
                <p className="text-xl text-gray-600 mb-6 text-center">You answered {TOTAL_QUESTIONS} questions!</p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 w-full p-6 rounded-2xl mb-8 flex justify-center items-center gap-4 border border-blue-100">
                    <Star className="w-10 h-10 text-yellow-500 fill-yellow-400" />
                    <span className="text-4xl font-bold text-indigo-700">{score} pts</span>
                </div>

                <div className="flex gap-4 w-full">
                    <button
                        onClick={onBack}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                    >
                        Return to Gallery
                    </button>
                    <button
                        onClick={() => {
                            setScore(0);
                            setStreak(0);
                            setQuestionsAnswered(0);
                            setGameState('playing');
                            generateQuestion();
                        }}
                        className="flex-1 flex items-center justify-center py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden border border-gray-100 relative">

            {/* Header HUD */}
            <div className="flex justify-between items-center bg-gray-50 border-b border-gray-100 px-6 py-4">
                <div className="flex gap-1">
                    {[...Array(TOTAL_QUESTIONS)].map((_, i) => (
                        <div key={i} className={`h-2.5 w-8 rounded-full ${i < questionsAnswered ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    {streak >= 2 && (
                        <div className="flex items-center text-orange-500 font-bold text-sm animate-bounce">
                            🔥 {streak} Streak!
                        </div>
                    )}
                    <div className="flex items-center text-indigo-700 font-bold text-lg bg-indigo-100 px-4 py-1.5 rounded-full">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-400 mr-1.5" />
                        {score}
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="p-8 text-center min-h-[300px] flex flex-col justify-center">
                {currentQuestion.type === 'findEmoji' ? (
                    <>
                        <h3 className="text-xl sm:text-2xl text-gray-500 mb-2 font-medium">Which face shows this feeling?</h3>
                        <h2 className={`text-4xl sm:text-5xl font-extrabold text-gray-900 mb-10`}>
                            "{currentQuestion.correct.emotion}"
                        </h2>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl sm:text-2xl text-gray-500 mb-4 font-medium">What is this face feeling?</h3>
                        <div className="text-8xl mb-8 filter drop-shadow-md">{currentQuestion.correct.emoji}</div>
                    </>
                )}

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleAnswer(option)}
                            disabled={gameState !== 'playing'}
                            className={`
                                relative p-6 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center justify-center
                                ${gameState === 'playing' ? 'border-gray-100 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1' : ''}
                                ${gameState !== 'playing' && option.id === currentQuestion.correct.id ? 'border-green-500 bg-green-50' : ''}
                                ${gameState === 'incorrect' && option.id !== currentQuestion.correct.id ? 'border-gray-200 bg-gray-50 opacity-50' : ''}
                            `}
                        >
                            {currentQuestion.type === 'findEmoji' ? (
                                <span className="text-6xl filter drop-shadow-sm">{option.emoji}</span>
                            ) : (
                                <span className="text-2xl font-bold text-gray-800">{option.emotion}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Feedback Area */}
                <div className={`mt-8 min-h-[80px] flex items-center justify-center transition-all ${gameState === 'playing' ? 'opacity-0' : 'opacity-100'}`}>
                    {gameState === 'correct' && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-green-100 px-6 py-4 rounded-2xl w-full border border-green-200 animate-bounce-in">
                            <Star className="w-8 h-8 text-green-600 fill-green-500" />
                            <div className="text-left flex-1 text-center sm:text-left">
                                <p className="text-green-800 font-bold text-lg">Excellent!</p>
                                <p className="text-green-700 text-sm">That is exactly right.</p>
                            </div>
                            <button onClick={handleNext} className="mt-2 sm:mt-0 flex items-center px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">
                                Next <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    )}

                    {gameState === 'incorrect' && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-red-50 px-6 py-4 rounded-2xl w-full border border-red-100 animate-fade-in">
                            <XCircle className="w-8 h-8 text-red-500" />
                            <div className="text-left flex-1 text-center sm:text-left">
                                <p className="text-red-800 font-bold text-lg">Not quite!</p>
                                <p className="text-red-700 text-sm">The correct answer was {currentQuestion.type === 'findEmoji' ? currentQuestion.correct.emoji : `"${currentQuestion.correct.emotion}"`}.</p>
                            </div>
                            <button onClick={handleNext} className="mt-2 sm:mt-0 flex items-center px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition">
                                Next <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmotionGame;
