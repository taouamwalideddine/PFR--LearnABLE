const bcrypt = require('bcryptjs');
const AppDataSource = require('../config/data-source');
const generateToken = require('../utils/generateToken');

// @desc register a new user
const registerUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const userRepository = AppDataSource.getRepository('User');
        const userExists = await userRepository.findOneBy({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = userRepository.create({
            email,
            password: hashedPassword,
            role: role || 'PARENT',
        });

        const user = await userRepository.save(newUser);

        if (user) {
            res.status(201).json({
                id: user.id,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc authenticate user and get token
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRepository = AppDataSource.getRepository('User');
        const user = await userRepository.findOneBy({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
