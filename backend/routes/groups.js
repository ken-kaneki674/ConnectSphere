const express = require('express');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all groups for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json([
        {
          id: 1,
          name: 'Développeurs Web',
          description: 'Groupe pour discuter de développement web',
          members_count: 156,
          members: [
            { id: 1, username: 'Alice', profile_picture: null },
            { id: 2, username: 'Bob', profile_picture: null },
            { id: 3, username: 'Charlie', profile_picture: null },
            { id: 4, username: 'David', profile_picture: null },
            { id: 5, username: 'Eve', profile_picture: null }
          ]
        },
        {
          id: 2,
          name: 'Design UI/UX',
          description: 'Partagez vos créations et obtenez des avis',
          members_count: 89,
          members: [
            { id: 6, username: 'Frank', profile_picture: null },
            { id: 7, username: 'Grace', profile_picture: null },
            { id: 8, username: 'Henry', profile_picture: null }
          ]
        }
      ]);
    }

    const [groups] = await pool.execute(`
      SELECT 
        g.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `, [userId]);

    // Get members for each group
    for (let group of groups) {
      const [members] = await pool.execute(`
        SELECT u.id, u.username, u.profile_picture
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
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est membre du groupe
    const [membership] = await pool.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (membership.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [groups] = await pool.execute(`
      SELECT g.*, 
             (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count
      FROM groups g
      WHERE g.id = ?
    `, [groupId]);

    if (groups.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const [members] = await pool.execute(`
      SELECT u.id, u.username, u.profile_picture, gm.role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.role DESC, u.username ASC
    `, [groupId]);

    res.json({
      ...groups[0],
      members
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, privacy } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name required' });
    }

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.status(201).json({
        id: Math.floor(Math.random() * 1000),
        name,
        description: description || '',
        privacy: privacy || 'public',
        members_count: 1,
        members: [{ id: userId, username: 'CurrentUser', profile_picture: null }]
      });
    }

    // Créer le groupe
    const [result] = await pool.execute(
      'INSERT INTO groups (name, description, privacy, creator_id) VALUES (?, ?, ?, ?)',
      [name, description || '', privacy || 'public', userId]
    );

    // Ajouter le créateur comme admin
    await pool.execute(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, "admin")',
      [result.insertId, userId]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description: description || '',
      privacy: privacy || 'public',
      members_count: 1
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join group
router.post('/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    // Vérifier si déjà membre
    const [existing] = await pool.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Already a member' });
    }

    // Ajouter comme membre
    await pool.execute(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, userId]
    );

    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave group
router.post('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not a member' });
    }

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete group (admin only)
router.delete('/:groupId', authenticateToken, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    // Vérifier si admin
    const [adminCheck] = await pool.execute(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND role = "admin"',
      [groupId, userId]
    );

    if (adminCheck.length === 0) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Supprimer le groupe (cascade delete supprimera les membres)
    await pool.execute('DELETE FROM groups WHERE id = ?', [groupId]);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
