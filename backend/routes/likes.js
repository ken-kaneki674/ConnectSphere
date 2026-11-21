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

// Toggle like on a post
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        liked: true,
        like: { id: Math.floor(Math.random() * 1000), user_id: userId, post_id: postId }
      });
    }

    // Vérifier si l'utilisateur a déjà liké
    const [existingLikes] = await pool.execute(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingLikes.length > 0) {
      // Unlike
      await pool.execute(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      
      res.json({
        liked: false,
        likeId: existingLikes[0].id
      });
    } else {
      // Like
      const [result] = await pool.execute(
        'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );
      
      res.json({
        liked: true,
        like: { id: result.insertId, user_id: userId, post_id: postId }
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get likes for a post
router.get('/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json([
        { id: 1, user_id: 1, post_id: postId, user: { username: 'User1' } },
        { id: 2, user_id: 2, post_id: postId, user: { username: 'User2' } }
      ]);
    }

    const [likes] = await pool.execute(`
      SELECT pl.*, u.username
      FROM post_likes pl
      JOIN users u ON pl.user_id = u.id
      WHERE pl.post_id = ?
      ORDER BY pl.created_at DESC
    `, [postId]);

    res.json(likes);
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if user liked a post
router.get('/:postId/check', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const [likes] = await pool.execute(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    res.json({ liked: likes.length > 0 });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
