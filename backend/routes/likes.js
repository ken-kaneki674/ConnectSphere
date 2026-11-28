const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const q = require('../utils/queries');
const store = require('../utils/devStore');

const router = express.Router();

// Toggle like on a post
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const key = `${postId}:${userId}`;
      const liked = !store.postLikes.has(key);
      if (liked) {
        store.postLikes.add(key);
      } else {
        store.postLikes.delete(key);
      }
      let likesCount = 0;
      store.postLikes.forEach((k) => {
        if (k.startsWith(`${postId}:`)) likesCount += 1;
      });
      return res.json({ liked, likes_count: likesCount });
    }

    if (!(await q.postExists(postId))) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const result = await q.toggleLike(postId, userId);
    res.json(result);
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get likes for a post
router.get('/:postId', async (req, res) => {
  try {
    const postId = Number(req.params.postId);

    if (store.isDevFallback()) {
      const list = [];
      store.postLikes.forEach((key) => {
        const [pId, uId] = key.split(':').map(Number);
        if (pId === postId) {
          const u = store.users.find((usr) => usr.id === uId);
          if (u) list.push({ user_id: uId, post_id: postId, username: u.username });
        }
      });
      return res.json(list);
    }

    const likes = await q.getLikes(postId);
    res.json(likes);
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check if user liked a post
router.get('/:postId/check', authenticateToken, async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      return res.json({ liked: store.postLikes.has(`${postId}:${userId}`) });
    }

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
