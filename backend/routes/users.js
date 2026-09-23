const express = require('express');
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const q = require('../utils/queries');

const router = express.Router();

// Search users by username
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const term = (req.query.q || '').trim();
    if (!term) return res.json([]);

    const [users] = await pool.execute(`
      SELECT id, username, profile_picture
      FROM users
      WHERE username LIKE ? AND is_active = 1
      ORDER BY username ASC
      LIMIT 20
    `, [`%${term.replace(/[\\%_]/g, '\\$&')}%`]);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT u.id, u.username, u.bio, u.profile_picture, u.created_at,
             (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
             (SELECT COUNT(*) FROM group_members WHERE user_id = u.id) AS groups_count,
             (SELECT COUNT(*) FROM friend_requests
               WHERE status = 1 AND (sender_id = u.id OR receiver_id = u.id)) AS friends_count
      FROM users u
      WHERE u.id = ? AND u.is_active = 1
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      ...user,
      posts_count: Number(user.posts_count),
      groups_count: Number(user.groups_count),
      friends_count: Number(user.friends_count)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Posts of a user
router.get('/:id/posts', optionalAuth, async (req, res) => {
  try {
    res.json(await q.getPosts(req.user?.id, 'WHERE p.user_id = ?', [req.params.id]));
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
