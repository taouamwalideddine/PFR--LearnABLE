const AppDataSource = require('../config/data-source');

// @desc create module
const createModule = async (req, res) => {
    const { title, description, orderIndex, courseId } = req.body;
    try {
        const repo = AppDataSource.getRepository('Module');
        const newModule = repo.create({ title, description, orderIndex, courseId });
        const savedModule = await repo.save(newModule);
        res.status(201).json(savedModule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc update module info
const updateModule = async (req, res) => {
    const { title, description, orderIndex } = req.body;
    try {
        const repo = AppDataSource.getRepository('Module');
        let moduleItem = await repo.findOne({ where: { id: req.params.id } });
        if (!moduleItem) return res.status(404).json({ message: 'Module not found' });
        
        moduleItem.title = title || moduleItem.title;
        moduleItem.description = description !== undefined ? description : moduleItem.description;
        if (orderIndex !== undefined) moduleItem.orderIndex = orderIndex;

        const updatedModule = await repo.save(moduleItem);
        res.json(updatedModule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc delete module
const deleteModule = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository('Module');
        const moduleItem = await repo.findOne({ where: { id: req.params.id } });
        if (!moduleItem) return res.status(404).json({ message: 'Module not found' });
        
        await repo.remove(moduleItem);
        res.json({ message: 'Module removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createModule,
    updateModule,
    deleteModule
};
