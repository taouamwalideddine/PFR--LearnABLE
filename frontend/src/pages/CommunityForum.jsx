import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Heart, Plus, Search, Trash2, X, Send, ChevronRight, Filter } from 'lucide-react';

const CATEGORIES = ['General', 'Tips & Strategies', 'Resources', 'Victories', 'Support'];
const CATEGORY_COLORS = {
    'General': 'bg-slate-100 text-slate-600',
    'Tips & Strategies': 'bg-indigo-100 text-indigo-700',
    'Resources': 'bg-emerald-100 text-emerald-700',
    'Victories': 'bg-amber-100 text-amber-700',
    'Support': 'bg-rose-100 text-rose-700',
};

const CommunityForum = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewPost, setShowNewPost] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [filterCat, setFilterCat] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // New post form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');

    // Comment form
    const [commentText, setCommentText] = useState('');

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/forum/posts');
            setPosts(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/forum/posts', { title, content, category });
            setTitle(''); setContent(''); setCategory('General');
            setShowNewPost(false);
            fetchPosts();
        } catch (e) { console.error(e); }
    };

    const handleLike = async (postId) => {
        try {
            await api.patch(`/forum/posts/${postId}/like`);
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
            if (selectedPost?.id === postId) setSelectedPost(prev => ({ ...prev, likes: prev.likes + 1 }));
        } catch (e) { console.error(e); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.delete(`/forum/posts/${postId}`);
            setPosts(prev => prev.filter(p => p.id !== postId));
            if (selectedPost?.id === postId) setSelectedPost(null);
        } catch (e) { console.error(e); }
    };

    const openPost = async (postId) => {
        try {
            const res = await api.get(`/forum/posts/${postId}`);
            setSelectedPost(res.data);
        } catch (e) { console.error(e); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await api.post(`/forum/posts/${selectedPost.id}/comments`, { content: commentText.trim() });
            setCommentText('');
            openPost(selectedPost.id);
        } catch (e) { console.error(e); }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/forum/comments/${commentId}`);
            openPost(selectedPost.id);
        } catch (e) { console.error(e); }
    };

    const filtered = posts
        .filter(p => filterCat === 'All' || p.category === filterCat)
        .filter(p => !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.content.toLowerCase().includes(searchTerm.toLowerCase()));

    const timeAgo = (date) => {
        const mins = Math.floor((Date.now() - new Date(date)) / 60000);
        if (mins < 60) return `${mins}m ago`;
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
        return `${Math.floor(mins / 1440)}d ago`;
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    return (
        <div className="p-8 lg:p-10 max-w-6xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center mb-2">
                        <MessageSquare className="w-10 h-10 mr-4 text-indigo-600" />
                        Community Forum
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">Share tips, celebrate wins, and support each other.</p>
                </div>
                <button
                    onClick={() => setShowNewPost(true)}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" /> New Post
                </button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                filterCat === cat
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* New Post Modal */}
            {showNewPost && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewPost(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-800">Create Post</h2>
                            <button onClick={() => setShowNewPost(false)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Post title"
                                required
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition font-bold text-lg"
                            />
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Share your thoughts..."
                                required
                                rows={5}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition resize-none"
                            />
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                                                category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
                                Publish
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 ${CATEGORY_COLORS[selectedPost.category] || 'bg-slate-100 text-slate-600'}`}>
                                        {selectedPost.category}
                                    </span>
                                    <h2 className="text-2xl font-extrabold text-slate-800">{selectedPost.title}</h2>
                                    <p className="text-sm text-slate-400 font-medium mt-1">{selectedPost.authorEmail} · {timeAgo(selectedPost.createdAt)}</p>
                                </div>
                                <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-slate-100 rounded-xl transition"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-slate-600 mt-4 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                            <div className="flex items-center gap-4 mt-5">
                                <button onClick={() => handleLike(selectedPost.id)} className="flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-rose-700 transition">
                                    <Heart className="w-4 h-4" /> {selectedPost.likes}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedPost.comments?.length || 0} Comments</p>
                            {(selectedPost.comments || []).map(c => (
                                <div key={c.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{c.authorEmail}</p>
                                            <p className="text-xs text-slate-400">{timeAgo(c.createdAt)}</p>
                                        </div>
                                        {(c.authorId === user?.id || user?.role === 'ADMIN') && (
                                            <button onClick={() => handleDeleteComment(c.id)} className="text-slate-400 hover:text-rose-500 transition">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-slate-600 mt-2 text-sm">{c.content}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleComment} className="p-4 border-t border-slate-100 flex gap-3">
                            <input
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition text-sm"
                            />
                            <button type="submit" disabled={!commentText.trim()} className="px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-40">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Posts Grid */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-500 mb-2">No Posts Yet</h3>
                    <p className="text-slate-400 font-medium">Be the first to share something with the community!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(post => (
                        <div
                            key={post.id}
                            onClick={() => openPost(post.id)}
                            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${CATEGORY_COLORS[post.category] || 'bg-slate-100 text-slate-600'}`}>
                                    {post.category}
                                </span>
                                {(post.authorId === user?.id || user?.role === 'ADMIN') && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-800 mb-2 group-hover:text-indigo-600 transition line-clamp-2">{post.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4">{post.content}</p>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 text-rose-500 font-bold"><Heart className="w-4 h-4" /> {post.likes}</span>
                                    <span className="flex items-center gap-1 text-slate-400 font-bold"><MessageSquare className="w-4 h-4" /> {post.commentCount}</span>
                                </div>
                                <span className="text-slate-400 text-xs font-medium">{post.authorEmail} · {timeAgo(post.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityForum;
