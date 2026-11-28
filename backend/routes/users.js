const express = require('express');
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const q = require('../utils/queries');
const store = require('../utils/devStore');

const router = express.Router();

// List members (useful for starting conversations & discovering community)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const viewerId = req.user?.id || 0;

    if (store.isDevFallback()) {
      const list = store.users
        .filter((u) => u.is_active && u.id !== viewerId)
        .map((u) => ({
          id: u.id,
          username: u.username,
          bio: u.bio || '',
          profile_picture: u.profile_picture || null,
        }));
      return res.json(list);
    }

    const [users] = await pool.execute(
      'SELECT id, username, bio, profile_picture FROM users WHERE is_active = 1 AND id != ? ORDER BY username ASC LIMIT 50',
      [viewerId]
    );
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users by username
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const term = (req.query.q || '').trim();
    if (!term) return res.json([]);

    if (store.isDevFallback()) {
      const qLower = term.toLowerCase();
      const matches = store.users
        .filter((u) => u.is_active && (u.username.toLowerCase().includes(qLower) || (u.bio || '').toLowerCase().includes(qLower)))
        .slice(0, 20)
        .map((u) => ({
          id: u.id,
          username: u.username,
          bio: u.bio || '',
          profile_picture: u.profile_picture || null,
        }));
      return res.json(matches);
    }

    const [users] = await pool.execute(`
      SELECT id, username, bio, profile_picture
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

// Update current authenticated user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio, profile_picture } = req.body;
    const cleanName = username ? String(username).trim() : null;

    if (store.isDevFallback()) {
      const user = store.users.find((u) => u.id === userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (cleanName && cleanName.toLowerCase() !== user.username.toLowerCase()) {
        const conflict = store.users.some((u) => u.id !== userId && u.username.toLowerCase() === cleanName.toLowerCase());
        if (conflict) return res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris" });
        user.username = cleanName;
      }
      if (bio !== undefined) user.bio = String(bio).trim();
      if (profile_picture !== undefined) user.profile_picture = profile_picture || null;

      return res.json({
        ...store.sanitizeUser(user),
        ...store.getUserCounts(userId),
      });
    }

    if (cleanName) {
      const [dup] = await pool.execute('SELECT id FROM users WHERE username = ? AND id != ?', [cleanName, userId]);
      if (dup.length > 0) {
        return res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris" });
      }
    }

    await pool.execute(
      `UPDATE users
       SET username = COALESCE(?, username),
           bio = COALESCE(?, bio),
           profile_picture = ?
       WHERE id = ?`,
      [cleanName, bio !== undefined ? String(bio).trim() : null, profile_picture !== undefined ? profile_picture || null : null, userId]
    );

    const [users] = await pool.execute(
      'SELECT id, username, email, bio, profile_picture, created_at FROM users WHERE id = ?',
      [userId]
    );
    res.json(users[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const targetId = Number(req.params.id);

    if (store.isDevFallback()) {
      const user = store.users.find((u) => u.id === targetId && u.is_active);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({
        ...store.sanitizeUser(user),
        ...store.getUserCounts(targetId),
      });
    }

    const [users] = await pool.execute(`
      SELECT u.id, u.username, u.bio, u.profile_picture, u.created_at,
             (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
             (SELECT COUNT(*) FROM group_members WHERE user_id = u.id) AS groups_count,
             (SELECT COUNT(*) FROM friend_requests
               WHERE status = 1 AND (sender_id = u.id OR receiver_id = u.id)) AS friends_count
      FROM users u
      WHERE u.id = ? AND u.is_active = 1
    `, [targetId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      ...user,
      posts_count: Number(user.posts_count),
      groups_count: Number(user.groups_count),
      friends_count: Number(user.friends_count),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Posts of a user
router.get('/:id/posts', optionalAuth, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const viewerId = req.user?.id || 0;

    if (store.isDevFallback()) {
      const userPosts = store.posts
        .filter((p) => p.user_id === targetId && !p.group_id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((p) => store.formatPost(p, viewerId));
      return res.json(userPosts);
    }

    res.json(await q.getPosts(viewerId, 'WHERE p.user_id = ? AND p.group_id IS NULL', [targetId]));
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
