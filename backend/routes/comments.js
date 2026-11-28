const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const q = require('../utils/queries');
const store = require('../utils/devStore');

const router = express.Router();

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const postId = Number(req.params.postId);

    if (store.isDevFallback()) {
      const list = store.comments
        .filter((c) => c.post_id === postId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at) || a.id - b.id)
        .map(store.formatComment);
      return res.json(list);
    }

    const comments = await q.getComments(postId);
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create comment
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const cleanContent = (req.body.content || '').trim();
    const userId = req.user.id;

    if (!cleanContent) {
      return res.status(400).json({ error: 'Content required' });
    }

    if (store.isDevFallback()) {
      const newComment = {
        id: store.genId(),
        post_id: postId,
        user_id: userId,
        content: cleanContent,
        created_at: new Date().toISOString(),
      };
      store.comments.push(newComment);
      return res.status(201).json(store.formatComment(newComment));
    }

    if (!(await q.postExists(postId))) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = await q.createComment(postId, userId, cleanContent);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const idx = store.comments.findIndex((c) => c.id === commentId && c.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Comment not found or unauthorized' });
      }
      store.comments.splice(idx, 1);
      return res.json({ message: 'Comment deleted successfully', id: commentId });
    }

    const [result] = await pool.execute(
      'DELETE FROM post_comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    res.json({ message: 'Comment deleted successfully', id: commentId });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
