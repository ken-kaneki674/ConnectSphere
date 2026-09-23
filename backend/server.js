const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET manquant : copiez backend/.env.example vers backend/.env');
  process.exit(1);
}
if (process.env.JWT_SECRET === 'change-me') {
  console.warn('⚠️  JWT_SECRET vaut encore « change-me » : définissez une valeur aléatoire dans backend/.env');
}

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8080' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.get('/api', (req, res) => {
  res.json({
    name: 'ConnectSphere API',
    endpoints: ['/api/auth', '/api/posts', '/api/comments', '/api/likes', '/api/messages', '/api/groups', '/api/users']
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});
