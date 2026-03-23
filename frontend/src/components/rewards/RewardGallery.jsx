import React, { useState, useEffect } from 'react';
import { Star, Award, Medal, Trophy } from 'lucide-react';
import api from '../../api/axios';

const RewardGallery = ({ childId }) => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const res = await api.get(`/rewards/child/${childId}`);
                setRewards(res.data);
            } catch (error) {
                console.error('Error fetching rewards:', error);
            } finally {
                setLoading(false);
            }
        };

        if (childId) {
            fetchRewards();
        }
    }, [childId]);

    if (loading) return <div className="p-4 text-center text-gray-500 animate-pulse">Loading amazing rewards...</div>;

    const renderIcon = (type) => {
        switch (type) {
            case 'STAR':
                return <Star className="w-12 h-12 text-yellow-500 fill-yellow-400" />;
            case 'BADGE':
                return <Award className="w-12 h-12 text-blue-500" />;
            case 'MEDAL':
                return <Medal className="w-12 h-12 text-blue-500" />;
            case 'TROPHY':
                return <Trophy className="w-12 h-12 text-yellow-500" />;
            default:
                return <Star className="w-12 h-12 text-gray-400" />;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center shadow-sm">
                    <Trophy className="w-6 h-6 mr-2" />
                    My Rewards Gallery
                </h2>
                <div className="bg-white/20 px-3 py-1 rounded-full text-white font-bold text-sm">
                    {rewards.length} Earned
                </div>
            </div>

            <div className="p-6">
                {rewards.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No rewards yet. Keep learning to earn stars and badges!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {rewards.map((reward) => (
                            <div
                                key={reward.id}
                                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow hover:scale-105 transform duration-200 cursor-pointer group"
                            >
                                <div className="mb-3 group-hover:rotate-12 transition-transform duration-300">
                                    {renderIcon(reward.type)}
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 text-center">{reward.name}</h3>
                                {reward.reason && (
                                    <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2" title={reward.reason}>
                                        {reward.reason}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RewardGallery;
