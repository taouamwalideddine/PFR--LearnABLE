import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, ArrowLeft, User } from 'lucide-react';

const MessagingPage = () => {
    const { childId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [childId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchData = async () => {
        try {
            const [msgRes, childRes] = await Promise.all([
                api.get(`/messages/child/${childId}`),
                api.get(`/children/${childId}`),
            ]);
            setMessages(msgRes.data);
            setChild(childRes.data);

            // extract contacts
            const contactMap = {};
            msgRes.data.forEach(m => {
                if (m.senderId !== user.id) {
                    contactMap[m.senderId] = m.senderEmail;
                }
                if (m.receiverId !== user.id) {
                    contactMap[m.receiverId] = m.receiverEmail;
                }
            });
            const contactList = Object.entries(contactMap).map(([id, email]) => ({ id, email }));
            setContacts(contactList);
            if (contactList.length > 0 && !selectedContact) {
                setSelectedContact(contactList[0].id);
            }

            // fetch linked adults
            if (user.role === 'PARENT') {
                const linkRes = await api.get(`/access-codes/links/${childId}`);
                linkRes.data.forEach(l => {
                    if (!contactMap[l.educatorId]) {
                        contactMap[l.educatorId] = l.educatorEmail;
                    }
                });
                const updatedContacts = Object.entries(contactMap).map(([id, email]) => ({ id, email }));
                setContacts(updatedContacts);
                if (updatedContacts.length > 0 && !selectedContact) {
                    setSelectedContact(updatedContacts[0].id);
                }
            }

            // mark read
            await api.patch(`/messages/read/${childId}`);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !selectedContact) return;
        try {
            await api.post('/messages', {
                receiverId: selectedContact,
                childId,
                content: newMsg.trim(),
            });
            setNewMsg('');
            fetchData();
        } catch (e) { console.error(e); }
    };

    const filteredMessages = selectedContact
        ? messages.filter(m =>
            (m.senderId === selectedContact || m.receiverId === selectedContact)
        )
        : messages;

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>;

    return (
        <div className="p-8 lg:p-10 max-w-5xl mx-auto min-h-screen">
            <Link to="/children" className="flex items-center text-slate-500 hover:text-slate-700 mb-6 transition font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 flex items-center mb-2">
                    <MessageCircle className="w-8 h-8 mr-3 text-indigo-600" />
                    Messages — {child?.name}
                </h1>
                <p className="text-slate-500 font-medium">Secure, child-specific communication channel.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Contact Tabs */}
                {contacts.length > 0 && (
                    <div className="flex border-b border-slate-100 overflow-x-auto">
                        {contacts.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedContact(c.id)}
                                className={`px-5 py-3 text-sm font-bold whitespace-nowrap transition ${
                                    selectedContact === c.id
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <User className="w-3.5 h-3.5 inline mr-1.5" />
                                {c.email}
                            </button>
                        ))}
                    </div>
                )}

                {/* Messages Area */}
                <div ref={scrollRef} className="h-[400px] overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    {filteredMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-400 font-medium">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        filteredMessages.map(msg => {
                            const isMe = msg.senderId === user.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                                        isMe
                                            ? 'bg-indigo-600 text-white rounded-br-md'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm'
                                    }`}>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input */}
                {selectedContact && (
                    <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-3">
                        <input
                            type="text"
                            value={newMsg}
                            onChange={(e) => setNewMsg(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newMsg.trim()}
                            className="px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-40"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                )}

                {!selectedContact && contacts.length === 0 && (
                    <div className="p-6 text-center border-t border-slate-100">
                        <p className="text-slate-400 text-sm font-medium">No linked educators or parents found. Use Access Codes to link first.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingPage;
