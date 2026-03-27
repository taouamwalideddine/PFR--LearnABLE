const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const childRoutes = require('./routes/childRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const activityRoutes = require('./routes/activityRoutes');
const progressRoutes = require('./routes/progressRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const routineRoutes = require('./routes/routineRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const AppDataSource = require('./config/data-source');

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LearnAble API is running' });
});

AppDataSource.initialize()
  .then(() => {
    console.log('PostgreSQL Database connected via TypeORM');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to PostgreSQL datababse:', error);
  });
