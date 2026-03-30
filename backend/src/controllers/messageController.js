const AppDataSource = require('../config/data-source');

// @desc send a message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, childId, content } = req.body;
        const repo = AppDataSource.getRepository('Message');
        const msg = repo.create({
            senderId: req.user.id,
            receiverId,
            childId,
            content,
        });
        const saved = await repo.save(msg);
        res.status(201).json(saved);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc get message thread for a child between current user and another user
const getMessages = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Message');
        const messages = await repo.find({
            where: { childId: req.params.childId },
            relations: ['sender', 'receiver'],
            order: { createdAt: 'ASC' },
        });

        const filtered = messages.filter(
            m => m.senderId === req.user.id || m.receiverId === req.user.id
        );

        res.json(filtered.map(m => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            senderEmail: m.sender?.email,
            receiverId: m.receiverId,
            receiverEmail: m.receiver?.email,
            readAt: m.readAt,
            createdAt: m.createdAt,
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc mark messages as read
const markAsRead = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Message');
        await repo
            .createQueryBuilder()
            .update('Message')
            .set({ readAt: new Date() })
            .where('childId = :childId', { childId: req.params.childId })
            .andWhere('receiverId = :userId', { userId: req.user.id })
            .andWhere('readAt IS NULL')
            .execute();
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { sendMessage, getMessages, markAsRead };
