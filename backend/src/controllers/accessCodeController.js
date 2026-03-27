const AppDataSource = require('../config/data-source');
const crypto = require('crypto');

// @desc    Generate an access code for a child (Parent only)
// @route   POST /api/access-codes/generate
// @access  Private (PARENT)
const generateCode = async (req, res) => {
    try {
        const { childId } = req.body;
        const childRepo = AppDataSource.getRepository('Child');
        const codeRepo = AppDataSource.getRepository('AccessCode');

        const child = await childRepo.findOneBy({ id: childId });
        if (!child) return res.status(404).json({ message: 'Child not found' });
        if (child.parentId !== req.user.id) {
            return res.status(403).json({ message: 'Only the parent who owns this profile can generate codes' });
        }

        // Generate a 6-character alphanumeric code
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();
        // Expires in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const accessCode = codeRepo.create({
            code,
            childId,
            parentId: req.user.id,
            expiresAt,
        });

        await codeRepo.save(accessCode);
        res.status(201).json({ code, expiresAt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Redeem an access code (Educator only)
// @route   POST /api/access-codes/redeem
// @access  Private (EDUCATEUR)
const redeemCode = async (req, res) => {
    try {
        const { code } = req.body;
        const codeRepo = AppDataSource.getRepository('AccessCode');
        const linkRepo = AppDataSource.getRepository('EducatorChild');

        const accessCode = await codeRepo.findOne({ where: { code }, relations: ['child'] });
        if (!accessCode) return res.status(404).json({ message: 'Invalid access code' });
        if (accessCode.isUsed) return res.status(400).json({ message: 'Code has already been used' });
        if (new Date() > new Date(accessCode.expiresAt)) {
            return res.status(400).json({ message: 'Code has expired' });
        }

        // Check if already linked
        const existing = await linkRepo.findOne({
            where: { educatorId: req.user.id, childId: accessCode.childId },
        });
        if (existing) return res.status(400).json({ message: 'You already have access to this student' });

        // Create the educator-child link
        const link = linkRepo.create({
            educatorId: req.user.id,
            childId: accessCode.childId,
        });
        await linkRepo.save(link);

        // Mark code as used
        accessCode.isUsed = true;
        accessCode.redeemedBy = req.user.id;
        await codeRepo.save(accessCode);

        res.json({
            message: 'Student linked successfully!',
            child: { id: accessCode.child.id, name: accessCode.child.name },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all educators linked to a child (Parent view)
// @route   GET /api/access-codes/links/:childId
// @access  Private (PARENT)
const getChildLinks = async (req, res) => {
    try {
        const linkRepo = AppDataSource.getRepository('EducatorChild');
        const links = await linkRepo.find({
            where: { childId: req.params.childId },
            relations: ['educator'],
        });
        res.json(links.map(l => ({
            id: l.id,
            educatorId: l.educatorId,
            educatorEmail: l.educator?.email,
            grantedAt: l.grantedAt,
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Revoke an educator's access to a child (Parent only)
// @route   DELETE /api/access-codes/links/:linkId
// @access  Private (PARENT)
const revokeAccess = async (req, res) => {
    try {
        const linkRepo = AppDataSource.getRepository('EducatorChild');
        const link = await linkRepo.findOneBy({ id: req.params.linkId });
        if (!link) return res.status(404).json({ message: 'Link not found' });

        await linkRepo.remove(link);
        res.json({ message: 'Access revoked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all students linked to the logged-in educator
// @route   GET /api/access-codes/my-students
// @access  Private (EDUCATEUR)
const getMyStudents = async (req, res) => {
    try {
        const linkRepo = AppDataSource.getRepository('EducatorChild');
        const links = await linkRepo.find({
            where: { educatorId: req.user.id },
            relations: ['child'],
        });
        res.json(links.map(l => ({
            linkId: l.id,
            childId: l.child?.id,
            childName: l.child?.name,
            childAge: l.child?.age,
            grantedAt: l.grantedAt,
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { generateCode, redeemCode, getChildLinks, revokeAccess, getMyStudents };
