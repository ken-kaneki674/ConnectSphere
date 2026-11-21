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

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json([
        {
          id: 1,
          content: 'Super post !',
          user: { username: 'User2', profile_picture: null },
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          content: 'Merci pour le partage',
          user: { username: 'User3', profile_picture: null },
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ]);
    }

    const [comments] = await pool.execute(`
      SELECT c.*, u.username, u.profile_picture
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create comment
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content } = req.body;
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
        created_at: new Date().toISOString()
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    const [newComment] = await pool.execute(`
      SELECT c.*, u.username, u.profile_picture
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM post_comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
