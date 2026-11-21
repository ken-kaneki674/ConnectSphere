const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all posts
router.get('/', async (req, res) => {
  try {
    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json([
        {
          id: 1,
          content: 'Bienvenue sur ConnectSphere !',
          user: { username: 'Admin', profile_picture: null },
          created_at: new Date().toISOString(),
          likes_count: 5
        },
        {
          id: 2,
          content: 'Ceci est un post de test.',
          user: { username: 'User1', profile_picture: null },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          likes_count: 3
        }
      ]);
    }

    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.profile_picture,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, image_path } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        id: Math.floor(Math.random() * 1000),
        content,
        user: { username: req.user.username, profile_picture: null },
        created_at: new Date().toISOString(),
        likes_count: 0
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, content, image_path) VALUES (?, ?, ?)',
      [userId, content, image_path || null]
    );

    const [newPost] = await pool.execute(`
      SELECT p.*, u.username, u.profile_picture,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json(newPost[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    const [posts] = await pool.execute(`
      SELECT p.*, u.username, u.profile_picture,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [postId]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(posts[0]);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
