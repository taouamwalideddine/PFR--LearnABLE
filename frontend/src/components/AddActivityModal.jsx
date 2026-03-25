import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';

const AddActivityModal = ({ lessonId, onClose, onSuccess, initialData }) => {
    const isEditing = !!initialData;
    const [title, setTitle] = useState('');
    const [type, setType] = useState('multiple_choice');
    
    // Multiple Choice content
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

    // Emotion Recognition content
    const [targetEmotion, setTargetEmotion] = useState('HAPPY');

    // Drag and Drop content
    const [ddBucket1, setDdBucket1] = useState('Animals');
    const [ddBucket2, setDdBucket2] = useState('Vehicles');
    const [ddItems, setDdItems] = useState([
        { text: 'Dog', bucket: 1 },
        { text: 'Car', bucket: 2 }
    ]);

    // Story Page / Info content
    const [storyPages, setStoryPages] = useState([
        { text: '', imageUrl: '' }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setType(initialData.type);
            const data = initialData.content || {};
            if (initialData.type === 'multiple_choice') {
                setQuestion(data.question || '');
                setOptions(data.options || ['', '']);
                setCorrectOptionIndex(data.correctOptionIndex || 0);
            } else if (initialData.type === 'emotion_recognition') {
                setTargetEmotion(data.targetEmotion || 'HAPPY');
            } else if (initialData.type === 'drag_drop') {
                setDdBucket1(data.bucket1 || 'Animals');
                setDdBucket2(data.bucket2 || 'Vehicles');
                setDdItems(data.items || [{ text: 'Dog', bucket: 1 }, { text: 'Car', bucket: 2 }]);
            } else if (initialData.type === 'information_card') {
                setStoryPages(data.pages || [{ text: '', imageUrl: '' }]);
            }
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let content = {};
            if (type === 'multiple_choice') {
                content = { question, options, correctOptionIndex };
            } else if (type === 'emotion_recognition') {
                content = { targetEmotion, prompt: `Identify the emotion: ${targetEmotion}` };
            } else if (type === 'drag_drop') {
                content = { bucket1: ddBucket1, bucket2: ddBucket2, items: ddItems };
            } else if (type === 'information_card') {
                content = { pages: storyPages };
            }

            const payload = {
                title,
                type,
                lessonId,
                content
            };

            if (isEditing) {
                await api.put(`/activities/${initialData.id}`, payload);
            } else {
                await api.post('/activities', payload);
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving activity:', err);
            setError(err.response?.data?.message || 'Failed to save activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 4) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
            if (correctOptionIndex >= newOptions.length) {
                setCorrectOptionIndex(0);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-bounce-in border-2 border-white">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-2xl font-extrabold text-slate-800">{isEditing ? 'Edit Activity' : 'Add New Activity'}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shadow-sm border border-slate-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                            {error}
                        </div>
                    )}

                    <form id="activityForm" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Activity Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium text-slate-700 outline-none"
                                placeholder="e.g., Number Recognition Quiz 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Activity Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium text-slate-700 outline-none"
                            >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="emotion_recognition">Emotion Recognition</option>
                                <option value="drag_drop">Drag and Drop</option>
                                <option value="information_card">Social Story / Info Card</option>
                            </select>
                        </div>

                        {/* --- Dynamic Content Fields --- */}
                        <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <h3 className="text-indigo-800 font-bold mb-4 flex items-center">
                                Configuration: {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </h3>
                            
                            {type === 'multiple_choice' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Question</label>
                                        <input
                                            type="text"
                                            required
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="What is 2 + 2?"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Options</label>
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="flex items-center gap-3 mb-3">
                                                <input 
                                                    type="radio" 
                                                    name="correctOption" 
                                                    checked={correctOptionIndex === idx}
                                                    onChange={() => setCorrectOptionIndex(idx)}
                                                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                                                    title="Mark as correct answer"
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${correctOptionIndex === idx ? 'bg-green-50 border-green-200 font-bold' : 'bg-white border-slate-200'}`}
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                                {options.length > 2 && (
                                                    <button type="button" onClick={() => removeOption(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {options.length < 4 && (
                                            <button type="button" onClick={addOption} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-2">
                                                <Plus className="w-4 h-4 mr-1" /> Add Option
                                            </button>
                                        )}
                                        <p className="text-xs text-slate-500 mt-3 italic">* Select the radio button next to the correct answer.</p>
                                    </div>
                                </div>
                            )}

                            {type === 'emotion_recognition' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Emotion to Identify</label>
                                    <select
                                        value={targetEmotion}
                                        onChange={(e) => setTargetEmotion(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="HAPPY">Happy</option>
                                        <option value="SAD">Sad</option>
                                        <option value="ANGRY">Angry</option>
                                        <option value="FEAR">Fear</option>
                                        <option value="SURPRISE">Surprise</option>
                                        <option value="DISGUST">Disgust</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-3">The child will be asked to identify this emotion from a set of images.</p>
                                </div>
                            )}

                            {type === 'drag_drop' && (
                                <div className="space-y-4 text-slate-700">
                                    <p className="text-sm font-bold text-slate-500 mb-4">Define two categories (buckets) and add items to sort into them.</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Bucket 1</label>
                                            <input type="text" value={ddBucket1} onChange={e => setDdBucket1(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Bucket 2</label>
                                            <input type="text" value={ddBucket2} onChange={e => setDdBucket2(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white" />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-bold mb-2">Items to Sort</label>
                                        {ddItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2 items-center">
                                                <input
                                                    type="text"
                                                    value={item.text}
                                                    onChange={(e) => {
                                                        const newArr = [...ddItems];
                                                        newArr[idx].text = e.target.value;
                                                        setDdItems(newArr);
                                                    }}
                                                    required
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                                    placeholder="Item text (e.g. Cat)"
                                                />
                                                <select
                                                    value={item.bucket}
                                                    onChange={(e) => {
                                                        const newArr = [...ddItems];
                                                        newArr[idx].bucket = parseInt(e.target.value);
                                                        setDdItems(newArr);
                                                    }}
                                                    className="w-40 px-2 py-2 border border-slate-200 rounded-lg bg-white"
                                                >
                                                    <option value={1}>{ddBucket1}</option>
                                                    <option value={2}>{ddBucket2}</option>
                                                </select>
                                                {ddItems.length > 2 && (
                                                    <button type="button" onClick={() => setDdItems(ddItems.filter((_, i) => i !== idx))} className="p-2 text-red-500 bg-white border border-slate-200 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {ddItems.length < 8 && (
                                            <button type="button" onClick={() => setDdItems([...ddItems, { text: '', bucket: 1 }])} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-2">
                                                <Plus className="w-4 h-4 mr-1" /> Add Sortable Item
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {type === 'information_card' && (
                                <div className="space-y-4 text-slate-700">
                                    <p className="text-sm font-bold text-slate-500 mb-4">Create a multi-page story or explanation. Children will read through these pages sequentially.</p>
                                    
                                    {storyPages.map((page, idx) => (
                                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl mb-4 relative shadow-sm">
                                            <div className="absolute top-2 right-2">
                                                {storyPages.length > 1 && (
                                                    <button type="button" onClick={() => setStoryPages(storyPages.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-700 mb-3">Page {idx + 1}</h4>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Image URL (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={page.imageUrl}
                                                        onChange={(e) => {
                                                            const newPages = [...storyPages];
                                                            newPages[idx].imageUrl = e.target.value;
                                                            setStoryPages(newPages);
                                                        }}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                                                        placeholder="https://example.com/image.png"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Text / Story Content</label>
                                                    <textarea
                                                        required
                                                        value={page.text}
                                                        onChange={(e) => {
                                                            const newPages = [...storyPages];
                                                            newPages[idx].text = e.target.value;
                                                            setStoryPages(newPages);
                                                        }}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm min-h-[80px] outline-none"
                                                        placeholder="Once upon a time..."
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        type="button" 
                                        onClick={() => setStoryPages([...storyPages, { text: '', imageUrl: '' }])} 
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-2 px-3 py-2 bg-white border border-indigo-100 rounded-lg shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Page
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end items-center space-x-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="activityForm"
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? 'Saving...' : 'Save Activity'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddActivityModal;
