const express = require('express');
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const q = require('../utils/queries');
const store = require('../utils/devStore');

const router = express.Router();

// Get all public feed posts (with optional pagination)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const viewerId = req.user?.id || 0;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

    if (store.isDevFallback()) {
      const feedPosts = store.posts
        .filter((p) => !p.group_id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id)
        .map((p) => store.formatPost(p, viewerId));
      const slice = limit && limit > 0 ? feedPosts.slice(offset, offset + limit) : feedPosts;
      return res.json(slice);
    }

    const posts = await q.getPosts(viewerId, 'WHERE p.group_id IS NULL', [], limit, offset);
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post (optionally scoped to a group_id)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, image_path, group_id } = req.body;
    const userId = req.user.id;
    const cleanContent = (content || '').trim();

    if (!cleanContent) {
      return res.status(400).json({ error: 'Le contenu est requis' });
    }

    if (store.isDevFallback()) {
      const newPost = {
        id: store.genId(),
        user_id: userId,
        group_id: group_id ? Number(group_id) : null,
        content: cleanContent,
        image_path: image_path || null,
        created_at: new Date().toISOString(),
      };
      store.posts.unshift(newPost);
      return res.status(201).json(store.formatPost(newPost, userId));
    }

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, group_id, content, image_path) VALUES (?, ?, ?, ?)',
      [userId, group_id ? Number(group_id) : null, cleanContent, image_path || null]
    );

    const newPost = await q.getPost(userId, result.insertId);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const viewerId = req.user?.id || 0;

    if (store.isDevFallback()) {
      const found = store.posts.find((p) => p.id === postId);
      if (!found) return res.status(404).json({ error: 'Post not found' });
      return res.json(store.formatPost(found, viewerId));
    }

    const post = await q.getPost(viewerId, postId);
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
    const postId = Number(req.params.id);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const idx = store.posts.findIndex((p) => p.id === postId && p.user_id === userId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Post not found or unauthorized' });
      }
      store.posts.splice(idx, 1);
      return res.json({ message: 'Post deleted successfully', id: postId });
    }

    const [result] = await pool.execute(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted successfully', id: postId });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
