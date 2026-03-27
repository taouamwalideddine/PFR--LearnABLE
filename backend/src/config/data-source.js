const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [
        require('../entities/User'),
        require('../entities/Child'),
        require('../entities/Course'),
        require('../entities/Module'),
        require('../entities/Lesson'),
        require('../entities/Activity'),
        require('../entities/Progress'),
        require('../entities/Reward'),
        require('../entities/Post'),
        require('../entities/Comment'),
        require('../entities/Routine'),
        require('../entities/RoutineStep'),
        require('../entities/AccessCode'),
        require('../entities/EducatorChild'),
        require('../entities/Message'),
    ],
});

module.exports = AppDataSource;
