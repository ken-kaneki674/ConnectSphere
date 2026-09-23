const express = require('express');
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const q = require('../utils/queries');

const router = express.Router();

// Get all posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    res.json(await q.getPosts(req.user?.id));
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    const { image_path } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, content, image_path) VALUES (?, ?, ?)',
      [req.user.id, content, image_path || null]
    );

    res.status(201).json(await q.getPost(req.user.id, result.insertId));
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await q.getPost(req.user?.id, req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
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

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    res.json(await q.getComments(req.params.id));
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const content = (req.body.content || '').trim();

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }
    if (!(await q.postExists(req.params.id))) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(201).json(await q.createComment(req.params.id, req.user.id, content));
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle like
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    if (!(await q.postExists(req.params.id))) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(await q.toggleLike(req.params.id, req.user.id));
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get likes for a post
router.get('/:id/likes', async (req, res) => {
  try {
    res.json(await q.getLikes(req.params.id));
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
