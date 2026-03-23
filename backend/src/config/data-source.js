const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true, // Use carefully in production. Good for dev/prototyping.
    logging: false,
    entities: [
        require('../entities/User'),
        require('../entities/Child'),
        require('../entities/Lesson'),
        require('../entities/Activity'),
        require('../entities/Progress'),
        require('../entities/Reward'),
        require('../entities/Post'),
        require('../entities/Comment'),
    ],
});

module.exports = AppDataSource;
