import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Copy, Check, Trash2, Link as LinkIcon, UserPlus, Shield, Clock } from 'lucide-react';

const AccessCodes = () => {
    const { user } = useAuth();
    const isParent = user?.role === 'PARENT';
    const isEducator = user?.role === 'EDUCATEUR';

    // Parent state
    const [children, setChildren] = useState([]);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [expiry, setExpiry] = useState(null);
    const [links, setLinks] = useState({});
    const [copied, setCopied] = useState(false);

    // Educator state
    const [redeemInput, setRedeemInput] = useState('');
    const [redeemResult, setRedeemResult] = useState(null);
    const [myStudents, setMyStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isParent) {
            fetchChildren();
        } else if (isEducator) {
            fetchMyStudents();
        }
        setLoading(false);
    }, []);

    const fetchChildren = async () => {
        try {
            const res = await api.get('/children');
            setChildren(res.data);
            // Fetch links for each child
            for (const child of res.data) {
                const linkRes = await api.get(`/access-codes/links/${child.id}`);
                setLinks(prev => ({ ...prev, [child.id]: linkRes.data }));
            }
        } catch (e) { console.error(e); }
    };

    const fetchMyStudents = async () => {
        try {
            const res = await api.get('/access-codes/my-students');
            setMyStudents(res.data);
        } catch (e) { console.error(e); }
    };

    const handleGenerate = async (childId) => {
        try {
            const res = await api.post('/access-codes/generate', { childId });
            setGeneratedCode(res.data.code);
            setExpiry(res.data.expiresAt);
            setCopied(false);
        } catch (e) { console.error(e); }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/access-codes/redeem', { code: redeemInput.trim().toUpperCase() });
            setRedeemResult({ success: true, child: res.data.child });
            setRedeemInput('');
            fetchMyStudents();
        } catch (err) {
            setRedeemResult({ success: false, message: err.response?.data?.message || 'Failed to redeem code' });
        }
    };

    const handleRevoke = async (linkId, childId) => {
        if (!window.confirm('Revoke this educator\'s access?')) return;
        try {
            await api.delete(`/access-codes/links/${linkId}`);
            setLinks(prev => ({
                ...prev,
                [childId]: prev[childId].filter(l => l.id !== linkId),
            }));
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    return (
        <div className="p-8 lg:p-10 max-w-5xl mx-auto min-h-screen">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center mb-3">
                    <Shield className="w-10 h-10 mr-4 text-indigo-600" />
                    {isParent ? 'Access & Linking' : 'Link Student'}
                </h1>
                <p className="text-slate-500 text-lg font-medium max-w-2xl">
                    {isParent
                        ? 'Generate temporary access codes for educators. Codes expire in 24 hours.'
                        : 'Enter an access code from a parent to link to a student\'s profile.'}
                </p>
            </div>

            {/* ========== PARENT VIEW ========== */}
            {isParent && (
                <>
                    {/* Generated Code Display */}
                    {generatedCode && (
                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200 mb-8 animate-fade-in">
                            <p className="text-sm font-bold text-indigo-600 mb-3 flex items-center gap-2">
                                <KeyRound className="w-4 h-4" /> Access Code Generated
                            </p>
                            <div className="flex items-center gap-4">
                                <code className="text-4xl font-mono font-extrabold text-indigo-900 tracking-[0.3em]">{generatedCode}</code>
                                <button onClick={handleCopy} className="p-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-100 transition">
                                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-indigo-600" />}
                                </button>
                            </div>
                            <p className="text-xs font-medium text-indigo-400 mt-3 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Expires: {new Date(expiry).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Children List */}
                    <div className="space-y-6">
                        {children.map(child => (
                            <div key={child.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                                            {child.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-800 text-lg">{child.name}</h3>
                                            <p className="text-sm font-medium text-slate-400">{child.age} years old</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleGenerate(child.id)}
                                        className="flex items-center px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all text-sm"
                                    >
                                        <KeyRound className="w-4 h-4 mr-2" /> Generate Code
                                    </button>
                                </div>

                                {/* Linked Educators */}
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" /> Linked Educators
                                    </p>
                                    {(links[child.id] || []).length === 0 ? (
                                        <p className="text-sm text-slate-400 italic">No educators linked yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {(links[child.id] || []).map(link => (
                                                <div key={link.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{link.educatorEmail}</p>
                                                        <p className="text-xs text-slate-400">Linked {new Date(link.grantedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRevoke(link.id, child.id)}
                                                        className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ========== EDUCATOR VIEW ========== */}
            {isEducator && (
                <>
                    {/* Redeem Code Form */}
                    <form onSubmit={handleRedeem} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
                        <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-indigo-500" /> Enter Access Code
                        </h2>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={redeemInput}
                                onChange={(e) => setRedeemInput(e.target.value)}
                                placeholder="e.g. A3F29B"
                                maxLength={6}
                                className="flex-1 px-5 py-3 text-lg font-mono tracking-[0.2em] text-center uppercase border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                            />
                            <button
                                type="submit"
                                disabled={redeemInput.length < 6}
                                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-40"
                            >
                                Link Student
                            </button>
                        </div>
                        {redeemResult && (
                            <div className={`mt-4 p-4 rounded-xl ${redeemResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                <p className="font-bold text-sm">
                                    {redeemResult.success
                                        ? `✓ Successfully linked to ${redeemResult.child.name}!`
                                        : `✕ ${redeemResult.message}`}
                                </p>
                            </div>
                        )}
                    </form>

                    {/* My Students */}
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 mb-5">My Linked Students</h2>
                        {myStudents.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                                <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No students linked yet. Ask a parent for an access code!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myStudents.map(s => (
                                    <div key={s.linkId} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                                            {s.childName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-800">{s.childName}</h3>
                                            <p className="text-sm text-slate-400">{s.childAge} years · Linked {new Date(s.grantedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AccessCodes;
