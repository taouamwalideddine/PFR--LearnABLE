const AppDataSource = require('../config/data-source');

// @desc get all rewards for a child
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
