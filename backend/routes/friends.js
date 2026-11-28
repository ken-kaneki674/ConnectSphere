const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const store = require('../utils/devStore');

const router = express.Router();

// List accepted friends of current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const friendIds = store.friendRequests
        .filter((f) => f.status === 1 && (f.sender_id === userId || f.receiver_id === userId))
        .map((f) => (f.sender_id === userId ? f.receiver_id : f.sender_id));
      const friends = store.users
        .filter((u) => friendIds.includes(u.id))
        .map((u) => ({
          id: u.id,
          username: u.username,
          bio: u.bio || '',
          profile_picture: u.profile_picture || null,
        }));
      return res.json(friends);
    }

    const [friends] = await pool.execute(`
      SELECT u.id, u.username, u.bio, u.profile_picture
      FROM friend_requests fr
      JOIN users u ON u.id = IF(fr.sender_id = ?, fr.receiver_id, fr.sender_id)
      WHERE fr.status = 1 AND (fr.sender_id = ? OR fr.receiver_id = ?)
      ORDER BY u.username ASC
    `, [userId, userId, userId]);

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// List pending incoming and outgoing friend requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const incoming = store.friendRequests
        .filter((f) => f.status === 0 && f.receiver_id === userId)
        .map((f) => {
          const sender = store.users.find((u) => u.id === f.sender_id);
          return {
            id: f.id,
            sender_id: f.sender_id,
            created_at: f.created_at,
            user: sender ? { id: sender.id, username: sender.username, bio: sender.bio, profile_picture: sender.profile_picture } : null,
          };
        })
        .filter((item) => item.user);

      const outgoing = store.friendRequests
        .filter((f) => f.status === 0 && f.sender_id === userId)
        .map((f) => {
          const receiver = store.users.find((u) => u.id === f.receiver_id);
          return {
            id: f.id,
            receiver_id: f.receiver_id,
            created_at: f.created_at,
            user: receiver ? { id: receiver.id, username: receiver.username, bio: receiver.bio, profile_picture: receiver.profile_picture } : null,
          };
        })
        .filter((item) => item.user);

      return res.json({ incoming, outgoing });
    }

    const [incoming] = await pool.execute(`
      SELECT fr.id, fr.sender_id, fr.created_at, u.username, u.bio, u.profile_picture
      FROM friend_requests fr
      JOIN users u ON u.id = fr.sender_id
      WHERE fr.receiver_id = ? AND fr.status = 0
      ORDER BY fr.created_at DESC
    `, [userId]);

    const [outgoing] = await pool.execute(`
      SELECT fr.id, fr.receiver_id, fr.created_at, u.username, u.bio, u.profile_picture
      FROM friend_requests fr
      JOIN users u ON u.id = fr.receiver_id
      WHERE fr.sender_id = ? AND fr.status = 0
      ORDER BY fr.created_at DESC
    `, [userId]);

    res.json({
      incoming: incoming.map((r) => ({ id: r.id, sender_id: r.sender_id, created_at: r.created_at, user: { id: r.sender_id, username: r.username, bio: r.bio, profile_picture: r.profile_picture } })),
      outgoing: outgoing.map((r) => ({ id: r.id, receiver_id: r.receiver_id, created_at: r.created_at, user: { id: r.receiver_id, username: r.username, bio: r.bio, profile_picture: r.profile_picture } })),
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check friendship status with target user: none | pending_sent | pending_received | friends
router.get('/status/:targetId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = Number(req.params.targetId);

    if (store.isDevFallback()) {
      const rel = store.friendRequests.find(
        (f) => f.status !== 2 && ((f.sender_id === userId && f.receiver_id === targetId) || (f.sender_id === targetId && f.receiver_id === userId))
      );
      if (!rel) return res.json({ status: 'none', requestId: null });
      if (rel.status === 1) return res.json({ status: 'friends', requestId: rel.id });
      return res.json({
        status: rel.sender_id === userId ? 'pending_sent' : 'pending_received',
        requestId: rel.id,
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, sender_id, receiver_id, status FROM friend_requests
       WHERE status != 2 AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       LIMIT 1`,
      [userId, targetId, targetId, userId]
    );
    if (rows.length === 0) return res.json({ status: 'none', requestId: null });
    const rel = rows[0];
    if (rel.status === 1) return res.json({ status: 'friends', requestId: rel.id });
    return res.json({
      status: rel.sender_id === userId ? 'pending_sent' : 'pending_received',
      requestId: rel.id,
    });
  } catch (error) {
    console.error('Friend status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send friend request
router.post('/request/:userId', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = Number(req.params.userId);

    if (!receiverId || senderId === receiverId) {
      return res.status(400).json({ error: 'Invalid target user' });
    }

    if (store.isDevFallback()) {
      const existing = store.friendRequests.find(
        (f) => f.status !== 2 && ((f.sender_id === senderId && f.receiver_id === receiverId) || (f.sender_id === receiverId && f.receiver_id === senderId))
      );
      if (existing) {
        if (existing.status === 0 && existing.sender_id === receiverId) {
          existing.status = 1;
          return res.json({ status: 'friends', requestId: existing.id });
        }
        return res.json({ status: existing.status === 1 ? 'friends' : 'pending_sent', requestId: existing.id });
      }
      const reqObj = { id: store.genId(), sender_id: senderId, receiver_id: receiverId, status: 0, created_at: new Date().toISOString() };
      store.friendRequests.push(reqObj);
      return res.status(201).json({ status: 'pending_sent', requestId: reqObj.id });
    }

    const [existing] = await pool.execute(
      `SELECT id, sender_id, status FROM friend_requests
       WHERE status != 2 AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))`,
      [senderId, receiverId, receiverId, senderId]
    );
    if (existing.length > 0) {
      const rel = existing[0];
      if (rel.status === 0 && rel.sender_id === receiverId) {
        await pool.execute('UPDATE friend_requests SET status = 1 WHERE id = ?', [rel.id]);
        return res.json({ status: 'friends', requestId: rel.id });
      }
      return res.json({ status: rel.status === 1 ? 'friends' : 'pending_sent', requestId: rel.id });
    }

    const [result] = await pool.execute(
      'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 0)',
      [senderId, receiverId]
    );
    res.status(201).json({ status: 'pending_sent', requestId: result.insertId });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Respond to friend request (action: 'accept' | 'decline')
router.post('/respond/:requestId', authenticateToken, async (req, res) => {
  try {
    const requestId = Number(req.params.requestId);
    const userId = req.user.id;
    const action = req.body.action === 'accept' ? 1 : 2;

    if (store.isDevFallback()) {
      const reqObj = store.friendRequests.find((f) => f.id === requestId && f.receiver_id === userId);
      if (!reqObj) return res.status(404).json({ error: 'Friend request not found' });
      reqObj.status = action;
      return res.json({ status: action === 1 ? 'friends' : 'declined', requestId });
    }

    const [result] = await pool.execute(
      'UPDATE friend_requests SET status = ? WHERE id = ? AND receiver_id = ?',
      [action, requestId, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    res.json({ status: action === 1 ? 'friends' : 'declined', requestId });
  } catch (error) {
    console.error('Respond friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove friend or cancel request
router.delete('/:targetUserId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = Number(req.params.targetUserId);

    if (store.isDevFallback()) {
      for (let i = store.friendRequests.length - 1; i >= 0; i -= 1) {
        const f = store.friendRequests[i];
        if ((f.sender_id === userId && f.receiver_id === targetId) || (f.sender_id === targetId && f.receiver_id === userId)) {
          store.friendRequests.splice(i, 1);
        }
      }
      return res.json({ status: 'none' });
    }

    await pool.execute(
      'DELETE FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      [userId, targetId, targetId, userId]
    );
    res.json({ status: 'none' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
