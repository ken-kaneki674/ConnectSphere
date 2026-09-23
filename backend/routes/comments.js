const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const q = require('../utils/queries');

const router = express.Router();

// Get comments for a post (alias de GET /api/posts/:id/comments)
router.get('/:postId', async (req, res) => {
  try {
    res.json(await q.getComments(req.params.postId));
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create comment (alias de POST /api/posts/:id/comments)
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const content = (req.body.content || '').trim();

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }
    if (!(await q.postExists(req.params.postId))) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(201).json(await q.createComment(req.params.postId, req.user.id, content));
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM post_comments WHERE id = ? AND user_id = ?',
      [req.params.commentId, req.user.id]
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
