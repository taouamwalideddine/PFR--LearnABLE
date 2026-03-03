const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const childRoutes = require('./routes/childRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LearnAble API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
