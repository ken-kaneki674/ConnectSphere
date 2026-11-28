const express = require('express');
const pool = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const q = require('../utils/queries');
const store = require('../utils/devStore');

const router = express.Router();

const fetchSqlGroupById = async (groupId, userId = 0) => {
  const [groups] = await pool.execute(`
    SELECT g.*,
           (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_count,
           EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = ?) AS is_member
    FROM \`groups\` g
    WHERE g.id = ?
  `, [userId || 0, groupId]);

  if (groups.length === 0) return null;

  const [members] = await pool.execute(`
    SELECT u.id, u.username, u.profile_picture, gm.role, gm.joined_at
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.role DESC, u.username ASC
  `, [groupId]);

  const g = groups[0];
  return {
    ...g,
    members_count: Number(g.members_count),
    is_member: Boolean(g.is_member),
    members,
  };
};

// Get all visible groups (public groups + groups where user is a member)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || 0;

    if (store.isDevFallback()) {
      const visible = store.groups
        .filter((g) => g.privacy === 'public' || store.groupMembers.some((m) => m.group_id === g.id && m.user_id === userId))
        .map((g) => store.formatGroup(g, userId));
      return res.json(visible);
    }

    const [groups] = await pool.execute(`
      SELECT DISTINCT g.*,
             (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_count,
             EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = ?) AS is_member
      FROM \`groups\` g
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
      WHERE g.privacy = 'public' OR gm.user_id IS NOT NULL
      ORDER BY g.created_at DESC
    `, [userId, userId]);

    for (const group of groups) {
      group.members_count = Number(group.members_count);
      group.is_member = Boolean(group.is_member);
      const [members] = await pool.execute(`
        SELECT u.id, u.username, u.profile_picture, gm.role
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = ?
        LIMIT 5
      `, [group.id]);
      group.members = members;
    }

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single group
router.get('/:groupId', optionalAuth, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user?.id || 0;

    if (store.isDevFallback()) {
      const found = store.groups.find((g) => g.id === groupId);
      if (!found) return res.status(404).json({ error: 'Group not found' });
      const formatted = store.formatGroup(found, userId);
      if (found.privacy === 'private' && !formatted.is_member) {
        return res.status(403).json({ error: 'Access denied' });
      }
      return res.json(formatted);
    }

    const group = await fetchSqlGroupById(groupId, userId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.privacy === 'private' && !group.is_member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, privacy, group_type, image } = req.body;
    const userId = req.user.id;
    const cleanName = (name || '').trim();

    if (!cleanName) {
      return res.status(400).json({ error: 'Group name required' });
    }

    const safePrivacy = privacy === 'private' ? 'private' : 'public';
    const safeType = group_type === 'chat' ? 'chat' : 'feed';

    if (store.isDevFallback()) {
      const newGroup = {
        id: store.genId(),
        creator_id: userId,
        name: cleanName,
        description: (description || '').trim(),
        privacy: safePrivacy,
        group_type: safeType,
        base_members_count: 0,
        image: image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
        created_at: new Date().toISOString(),
      };
      store.groups.unshift(newGroup);
      store.groupMembers.push({ group_id: newGroup.id, user_id: userId, role: 'admin' });
      return res.status(201).json(store.formatGroup(newGroup, userId));
    }

    const [result] = await pool.execute(
      'INSERT INTO `groups` (name, description, privacy, group_type, image, creator_id) VALUES (?, ?, ?, ?, ?, ?)',
      [cleanName, (description || '').trim(), safePrivacy, safeType, image || null, userId]
    );

    await pool.execute(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, "admin")',
      [result.insertId, userId]
    );

    const created = await fetchSqlGroupById(result.insertId, userId);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update group (admin only)
router.put('/:groupId', authenticateToken, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;
    const { name, description, privacy, group_type } = req.body;

    if (store.isDevFallback()) {
      const group = store.groups.find((g) => g.id === groupId);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      const isAdmin = store.groupMembers.some((m) => m.group_id === groupId && m.user_id === userId && m.role === 'admin');
      if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });
      if (name && name.trim()) group.name = name.trim();
      if (description !== undefined) group.description = String(description).trim();
      if (privacy === 'public' || privacy === 'private') group.privacy = privacy;
      if (group_type === 'feed' || group_type === 'chat') group.group_type = group_type;
      return res.json(store.formatGroup(group, userId));
    }

    const [adminCheck] = await pool.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND role = "admin"',
      [groupId, userId]
    );
    if (adminCheck.length === 0) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await pool.execute(
      'UPDATE `groups` SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
      [name ? name.trim() : null, description !== undefined ? String(description).trim() : null, groupId]
    );

    const updated = await fetchSqlGroupById(groupId, userId);
    res.json(updated);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle or join group (returns updated group)
router.post('/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const group = store.groups.find((g) => g.id === groupId);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      const existingIdx = store.groupMembers.findIndex((m) => m.group_id === groupId && m.user_id === userId);
      if (existingIdx === -1) {
        store.groupMembers.push({ group_id: groupId, user_id: userId, role: 'member' });
      }
      return res.json(store.formatGroup(group, userId));
    }

    await pool.execute(
      'INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    const updated = await fetchSqlGroupById(groupId, userId);
    if (!updated) return res.status(404).json({ error: 'Group not found' });
    res.json(updated);
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave group (returns updated group)
router.post('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const group = store.groups.find((g) => g.id === groupId);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      const existingIdx = store.groupMembers.findIndex((m) => m.group_id === groupId && m.user_id === userId);
      if (existingIdx !== -1) {
        store.groupMembers.splice(existingIdx, 1);
      }
      return res.json(store.formatGroup(group, userId));
    }

    await pool.execute(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    const updated = await fetchSqlGroupById(groupId, userId);
    if (!updated) return res.status(404).json({ error: 'Group not found' });
    res.json(updated);
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Group posts (feed groups)
router.get('/:groupId/posts', optionalAuth, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const viewerId = req.user?.id || 0;

    if (store.isDevFallback()) {
      const list = store.posts
        .filter((p) => p.group_id === groupId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id)
        .map((p) => store.formatPost(p, viewerId));
      return res.json(list);
    }

    const posts = await q.getPosts(viewerId, 'WHERE p.group_id = ?', [groupId]);
    res.json(posts);
  } catch (error) {
    console.error('Get group posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:groupId/posts', authenticateToken, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;
    const cleanContent = (req.body.content || '').trim();
    const imagePath = req.body.image_path || null;

    if (!cleanContent) {
      return res.status(400).json({ error: 'Content required' });
    }

    if (store.isDevFallback()) {
      const newPost = {
        id: store.genId(),
        user_id: userId,
        group_id: groupId,
        content: cleanContent,
        image_path: imagePath,
        created_at: new Date().toISOString(),
      };
      store.posts.unshift(newPost);
      return res.status(201).json(store.formatPost(newPost, userId));
    }

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, group_id, content, image_path) VALUES (?, ?, ?, ?)',
      [userId, groupId, cleanContent, imagePath]
    );
    const created = await q.getPost(userId, result.insertId);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create group post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Group chat messages (chat groups)
router.get('/:groupId/messages', optionalAuth, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);

    if (store.isDevFallback()) {
      const list = store.groupMessages
        .filter((m) => m.group_id === groupId)
        .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at) || a.id - b.id)
        .map((m) => {
          const sender = store.users.find((u) => u.id === m.sender_id);
          return {
            ...m,
            username: sender?.username || 'Membre',
            profile_picture: sender?.profile_picture || null,
          };
        });
      return res.json(list);
    }

    const [rows] = await pool.execute(`
      SELECT gm.*, u.username, u.profile_picture
      FROM group_messages gm
      JOIN users u ON gm.sender_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.sent_at ASC, gm.id ASC
    `, [groupId]);
    res.json(rows);
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;
    const cleanContent = (req.body.content || '').trim();

    if (!cleanContent) {
      return res.status(400).json({ error: 'Content required' });
    }

    if (store.isDevFallback()) {
      const msg = {
        id: store.genId(),
        group_id: groupId,
        sender_id: userId,
        content: cleanContent,
        sent_at: new Date().toISOString(),
      };
      store.groupMessages.push(msg);
      const sender = store.users.find((u) => u.id === userId);
      return res.status(201).json({
        ...msg,
        username: sender?.username || req.user.username,
        profile_picture: sender?.profile_picture || null,
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO group_messages (group_id, sender_id, content) VALUES (?, ?, ?)',
      [groupId, userId, cleanContent]
    );
    const [rows] = await pool.execute(`
      SELECT gm.*, u.username, u.profile_picture
      FROM group_messages gm
      JOIN users u ON gm.sender_id = u.id
      WHERE gm.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete group (admin only)
router.delete('/:groupId', authenticateToken, async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const idx = store.groups.findIndex((g) => g.id === groupId);
      if (idx === -1) return res.status(404).json({ error: 'Group not found' });
      const isAdmin = store.groupMembers.some((m) => m.group_id === groupId && m.user_id === userId && m.role === 'admin');
      if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });
      store.groups.splice(idx, 1);
      return res.json({ message: 'Group deleted successfully' });
    }

    const [adminCheck] = await pool.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND role = "admin"',
      [groupId, userId]
    );

    if (adminCheck.length === 0) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await pool.execute('DELETE FROM `groups` WHERE id = ?', [groupId]);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
