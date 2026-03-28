import React, { useState } from 'react';
import { ArrowRight, CheckCircle, BookOpen } from 'lucide-react';

const InformationCard = ({ activity, onComplete }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const pages = activity.content?.pages || [];

    if (pages.length === 0) {
        return <div className="p-8 text-center text-slate-500 font-medium">No story content available.</div>;
    }

    const currentPageData = pages[currentPage];
    const isLastPage = currentPage === pages.length - 1;

    const handleNext = () => {
        if (isLastPage) {
            onComplete(true);
        } else {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 animate-slide-up relative">
            
            {/* Header progress bar implicitly shown via dots */}
            <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center text-indigo-800 font-bold">
                    <BookOpen className="w-6 h-6 mr-3 text-indigo-600" />
                    {activity.title || 'Social Story'}
                </div>
                
                {/* Pagination Dots */}
                <div className="flex gap-2">
                    {pages.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentPage ? 'w-8 bg-indigo-600' : 'w-2.5 bg-indigo-200'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col items-center justify-center text-center">
                {currentPageData.imageUrl && (
                    <div className="mb-8 relative w-full max-w-3xl min-h-[300px] max-h-[500px] rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50 flex items-center justify-center group">
                        <img 
                            src={currentPageData.imageUrl} 
                            alt={`Story Page ${currentPage + 1}`} 
                            className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        {/* Fallback if image fails or is missing but imageUrl was provided */}
                        <div className="hidden absolute inset-0 flex-col py-10 items-center justify-center text-slate-400">
                            <BookOpen className="w-16 h-16 opacity-20 mb-4" />
                            <span className="text-sm">Image could not be loaded</span>
                        </div>
                    </div>
                )}
                
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-800 leading-tight md:leading-snug max-w-3xl animate-fade-in text-center mx-auto">
                    {currentPageData.text}
                </h3>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                    onClick={handleNext}
                    className={`
                        flex items-center px-8 py-4 font-bold rounded-2xl text-lg shadow-xl hover:-translate-y-1 transition-all
                        ${isLastPage 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30 hover:shadow-green-500/40' 
                            : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40'
                        }
                    `}
                >
                    {isLastPage ? (
                        <>
                            Finish Story <CheckCircle className="w-6 h-6 ml-3" />
                        </>
                    ) : (
                        <>
                            Next Page <ArrowRight className="w-6 h-6 ml-3" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InformationCard;
