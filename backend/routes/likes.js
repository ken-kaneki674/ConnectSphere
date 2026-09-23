const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const q = require('../utils/queries');

const router = express.Router();

// Toggle like on a post (alias de POST /api/posts/:id/like)
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    if (!(await q.postExists(req.params.postId))) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(await q.toggleLike(req.params.postId, req.user.id));
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get likes for a post (alias de GET /api/posts/:id/likes)
router.get('/:postId', async (req, res) => {
  try {
    res.json(await q.getLikes(req.params.postId));
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if user liked a post
router.get('/:postId/check', authenticateToken, async (req, res) => {
  try {
    const [likes] = await pool.execute(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [req.params.postId, req.user.id]
    );

    res.json({ liked: likes.length > 0 });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
