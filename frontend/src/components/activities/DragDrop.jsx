import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const DragDrop = ({ activity, onComplete }) => {
    // Expected content: { bucket1: 'Animals', bucket2: 'Vehicles', items: [{ text: 'Dog', bucket: 1 }, { text: 'Car', bucket: 2 }] }
    
    const [items, setItems] = useState([]);
    const [bucket1Items, setBucket1Items] = useState([]);
    const [bucket2Items, setBucket2Items] = useState([]);
    
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [status, setStatus] = useState('playing'); // 'playing', 'checking', 'success'

    useEffect(() => {
        if (activity && activity.content && activity.content.items) {
            resetGame();
        }
    }, [activity]);

    const resetGame = () => {
        const scrambled = [...activity.content.items].map((item, id) => ({ ...item, id })).sort(() => Math.random() - 0.5);
        setItems(scrambled);
        setBucket1Items([]);
        setBucket2Items([]);
        setStatus('playing');
    };

    const handleDragStart = (e, itemIndex, sourceList) => {
        if (status !== 'playing') return;
        e.dataTransfer.setData('text/plain', JSON.stringify({ itemIndex, sourceList }));
        setDraggedItemIndex(itemIndex);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetBucketId) => {
        if (status !== 'playing') return;
        e.preventDefault();
        setDraggedItemIndex(null);
        
        const dataStr = e.dataTransfer.getData('text/plain');
        if (!dataStr) return;
        
        try {
            const { itemIndex, sourceList } = JSON.parse(dataStr);
            let draggedItem = null;

            if (sourceList === 'items') {
                draggedItem = items[itemIndex];
                setItems(prev => prev.filter((_, i) => i !== itemIndex));
            } else if (sourceList === 'bucket1') {
                draggedItem = bucket1Items[itemIndex];
                setBucket1Items(prev => prev.filter((_, i) => i !== itemIndex));
            } else if (sourceList === 'bucket2') {
                draggedItem = bucket2Items[itemIndex];
                setBucket2Items(prev => prev.filter((_, i) => i !== itemIndex));
            }

            if (!draggedItem) return;

            // Allow dropping anywhere during "playing" phase
            if (targetBucketId === 1) {
                setBucket1Items(prev => [...prev, draggedItem]);
            } else {
                setBucket2Items(prev => [...prev, draggedItem]);
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    // Allow dragging back to the pool
    const handleDropToPool = (e) => {
        if (status !== 'playing') return;
        e.preventDefault();
        setDraggedItemIndex(null);
        
        const dataStr = e.dataTransfer.getData('text/plain');
        if (!dataStr) return;
        
        try {
            const { itemIndex, sourceList } = JSON.parse(dataStr);
            let draggedItem = null;

            if (sourceList === 'bucket1') {
                draggedItem = bucket1Items[itemIndex];
                setBucket1Items(prev => prev.filter((_, i) => i !== itemIndex));
            } else if (sourceList === 'bucket2') {
                draggedItem = bucket2Items[itemIndex];
                setBucket2Items(prev => prev.filter((_, i) => i !== itemIndex));
            }

            if (draggedItem) {
                setItems(prev => [...prev, draggedItem]);
            }
        } catch (err) {}
    };

    const handleCheckAnswers = () => {
        const errors1 = bucket1Items.filter(item => item.bucket !== 1);
        const errors2 = bucket2Items.filter(item => item.bucket !== 2);
        
        if (errors1.length === 0 && errors2.length === 0) {
            setStatus('success');
            setTimeout(() => onComplete(true), 2500); 
        } else {
            setStatus('checking'); // Reveal incorrect items
        }
    };

    if (!activity || !activity.content) return null;

    const { bucket1, bucket2 } = activity.content;
    const allPlaced = items.length === 0 && (bucket1Items.length + bucket2Items.length) > 0;

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-100 rounded-3xl shadow-xl border border-slate-200 p-8 animate-fade-in relative">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-8 text-center text-balance leading-tight">
                {activity.title}
            </h2>

            {status === 'success' && (
                <div className="absolute inset-0 z-20 bg-slate-100/80 backdrop-blur-sm flex items-center justify-center rounded-3xl animate-fade-in text-center flex-col">
                    <div className="bg-emerald-500 rounded-full text-white animate-bounce-in shadow-xl mb-4">
                        <CheckCircle2 className="w-20 h-20" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800 h-10 overflow-visible text-emerald-600 drop-shadow-sm">Perfect Sorting!</h3>
                </div>
            )}

            {status === 'checking' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg animate-bounce-in flex items-center">
                    <XCircle className="w-6 h-6 mr-2" />
                    Some items are in the wrong bucket!
                </div>
            )}

            {/* Unsorted Items Pool */}
            <div 
                className={`mb-6 p-6 rounded-2xl border-4 border-dashed min-h-[140px] transition-colors ${status === 'playing' ? 'bg-white border-slate-300' : 'bg-slate-50 border-slate-200 opacity-50'}`}
                onDragOver={handleDragOver}
                onDrop={handleDropToPool}
            >
                <div className="flex justify-between items-end border-b border-slate-100 pb-2 mb-4">
                    <h3 className="text-slate-400 font-bold uppercase text-sm tracking-wider">Drag items from here</h3>
                    
                    {allPlaced && status === 'playing' && (
                        <button onClick={handleCheckAnswers} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:-translate-y-1 transition-transform animate-bounce-in">
                            Check Answers
                        </button>
                    )}
                    
                    {status === 'checking' && (
                        <button onClick={resetGame} className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-xl shadow-md hover:-translate-y-1 transition-transform animate-bounce-in flex items-center">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </button>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                    {items.map((item, idx) => (
                        <div
                            key={item.id}
                            draggable={status === 'playing'}
                            onDragStart={(e) => handleDragStart(e, idx, 'items')}
                            onDragEnd={() => setDraggedItemIndex(null)}
                            className="px-6 py-3 bg-indigo-500 text-white font-bold text-lg rounded-xl cursor-grab shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
                        >
                            {item.text}
                        </div>
                    ))}
                    {items.length === 0 && status === 'playing' && <span className="text-emerald-500 font-bold italic py-4 animate-pulse">All items placed! Click 'Check Answers'</span>}
                </div>
            </div>

            {/* Buckets Area */}
            <div className="grid grid-cols-2 gap-8">
                {/* Bucket 1 */}
                <div 
                    className={`border-4 rounded-3xl p-6 min-h-[250px] flex flex-col transition-colors ${status === 'playing' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 1)}
                >
                    <div className={`text-center pb-4 border-b-2 mb-4 font-black tracking-wide uppercase text-xl ${status === 'playing' ? 'border-indigo-100 text-indigo-700' : 'border-slate-200 text-slate-400'}`}>
                        {bucket1}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-3 content-start">
                        {bucket1Items.map((item, idx) => {
                            let itemClass = "px-5 py-2 font-bold rounded-lg shadow-sm cursor-grab ";
                            if (status === 'playing') itemClass += "bg-indigo-600 text-white hover:-translate-y-0.5";
                            else if (status === 'checking') {
                                itemClass += item.bucket === 1 ? "bg-emerald-500 text-white" : "bg-red-500 text-white animate-pulse";
                            } else itemClass += "bg-slate-400 text-white";
                                
                            return (
                                <div 
                                    key={item.id} 
                                    className={itemClass}
                                    draggable={status === 'playing'}
                                    onDragStart={(e) => handleDragStart(e, idx, 'bucket1')}
                                >
                                    {item.text}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bucket 2 */}
                <div 
                    className={`border-4 rounded-3xl p-6 min-h-[250px] flex flex-col transition-colors ${status === 'playing' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 2)}
                >
                    <div className={`text-center pb-4 border-b-2 mb-4 font-black tracking-wide uppercase text-xl ${status === 'playing' ? 'border-purple-100 text-purple-700' : 'border-slate-200 text-slate-400'}`}>
                        {bucket2}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-3 content-start">
                        {bucket2Items.map((item, idx) => {
                            let itemClass = "px-5 py-2 font-bold rounded-lg shadow-sm cursor-grab ";
                            if (status === 'playing') itemClass += "bg-purple-600 text-white hover:-translate-y-0.5";
                            else if (status === 'checking') {
                                itemClass += item.bucket === 2 ? "bg-emerald-500 text-white" : "bg-red-500 text-white animate-pulse";
                            } else itemClass += "bg-slate-400 text-white";

                            return (
                                <div 
                                    key={item.id} 
                                    className={itemClass}
                                    draggable={status === 'playing'}
                                    onDragStart={(e) => handleDragStart(e, idx, 'bucket2')}
                                >
                                    {item.text}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <p className="text-center text-slate-400 mt-6 text-sm font-medium">Use your mouse or finger to drag items. You can drag them back out if you make a mistake.</p>
        </div>
    );
};

export default DragDrop;
