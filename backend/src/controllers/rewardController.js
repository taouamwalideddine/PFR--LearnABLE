const AppDataSource = require('../config/data-source');

// @desc    Get all rewards for a child
// @route   GET /api/rewards/child/:childId
// @access  Private
const getChildRewards = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Reward');
        const rewards = await repo.find({
            where: { childId: req.params.childId },
            order: { createdAt: 'DESC' },
        });
        res.json(rewards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getChildRewards,
};
