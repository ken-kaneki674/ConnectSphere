const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting: generous for app browsing, stricter on auth endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
});
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API health & endpoints overview
app.get('/api', (req, res) => {
  res.json({
    name: 'ConnectSphere API',
    status: 'ok',
    endpoints: [
      '/api/auth',
      '/api/posts',
      '/api/comments',
      '/api/likes',
      '/api/messages',
      '/api/groups',
      '/api/users',
      '/api/friends',
      '/api/reports',
    ],
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
