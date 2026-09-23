const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Un groupe avec son nombre de membres, le rôle de l'utilisateur courant et un aperçu des membres
const getGroup = async (groupId, userId, membersLimit = 5) => {
  const [groups] = await pool.execute(`
    SELECT g.*,
           (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_count,
           (SELECT role FROM group_members WHERE group_id = g.id AND user_id = ?) AS my_role
    FROM \`groups\` g
    WHERE g.id = ?
  `, [userId, groupId]);

  if (groups.length === 0) return null;

  const [members] = await pool.execute(`
    SELECT u.id, u.username, u.profile_picture, gm.role, gm.joined_at
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.role = 'admin' DESC, u.username ASC
    LIMIT ${Number(membersLimit)}
  `, [groupId]);

  const { my_role, ...group } = groups[0];
  return {
    ...group,
    members_count: Number(group.members_count),
    is_member: my_role !== null,
    is_admin: my_role === 'admin',
    members
  };
};

// Get all groups (publics + privés dont l'utilisateur est membre)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(`
      SELECT g.id
      FROM \`groups\` g
      LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
      WHERE g.privacy = 'public' OR gm.id IS NOT NULL
      ORDER BY gm.id IS NULL, g.created_at DESC
    `, [userId]);

    const groups = await Promise.all(rows.map(row => getGroup(row.id, userId)));
    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single group
router.get('/:groupId', async (req, res) => {
  try {
    const group = await getGroup(req.params.groupId, req.user.id, 100);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
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
router.post('/', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const { description } = req.body;
    const privacy = req.body.privacy === 'private' ? 'private' : 'public';
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO `groups` (name, description, privacy, creator_id) VALUES (?, ?, ?, ?)',
      [name, description || '', privacy, userId]
    );

    // Ajouter le créateur comme admin
    await pool.execute(
      "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')",
      [result.insertId, userId]
    );

    res.status(201).json(await getGroup(result.insertId, userId));
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update group (admin only)
router.put('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await getGroup(groupId, req.user.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (!group.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const name = (req.body.name ?? group.name).trim();
    const description = req.body.description ?? group.description;
    const privacy = (req.body.privacy ?? group.privacy) === 'private' ? 'private' : 'public';

    if (!name) {
      return res.status(400).json({ error: 'Group name required' });
    }

    await pool.execute(
      'UPDATE `groups` SET name = ?, description = ?, privacy = ? WHERE id = ?',
      [name, description, privacy, groupId]
    );

    res.json(await getGroup(groupId, req.user.id));
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join group
router.post('/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const group = await getGroup(groupId, userId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (group.is_member) {
      return res.status(409).json({ error: 'Already a member' });
    }
    if (group.privacy === 'private') {
      return res.status(403).json({ error: 'Private group' });
    }

    await pool.execute(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    res.json(await getGroup(groupId, userId));
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave group
router.post('/:groupId/leave', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not a member' });
    }

    res.json(await getGroup(groupId, userId));
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete group (admin only)
router.delete('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const [adminCheck] = await pool.execute(
      "SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'admin'",
      [groupId, req.user.id]
    );

    if (adminCheck.length === 0) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // La suppression en cascade retire aussi les membres
    await pool.execute('DELETE FROM `groups` WHERE id = ?', [groupId]);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
