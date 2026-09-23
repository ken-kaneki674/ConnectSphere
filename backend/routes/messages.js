const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

const formatMessage = (msg, userId) => ({
  id: msg.id,
  conversation_id: msg.conversation_id,
  sender_id: msg.sender_id,
  username: msg.username,
  content: msg.content,
  is_read: Boolean(msg.is_read),
  created_at: msg.sent_at,
  is_sender: msg.sender_id === userId
});

const isParticipant = async (conversationId, userId) => {
  const [rows] = await pool.execute(
    'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    [conversationId, userId, userId]
  );
  return rows.length > 0;
};

const getConversations = async (userId) => {
  const [conversations] = await pool.execute(`
    SELECT
      c.id,
      c.updated_at,
      u.id AS other_id,
      u.username AS other_username,
      u.profile_picture AS other_profile_picture,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC, id DESC LIMIT 1) AS last_message,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id <> ? AND is_read = 0) AS unread
    FROM conversations c
    JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
    WHERE c.user1_id = ? OR c.user2_id = ?
    ORDER BY c.updated_at DESC
  `, [userId, userId, userId, userId]);

  return conversations.map(conv => ({
    id: conv.id,
    user: {
      id: conv.other_id,
      username: conv.other_username,
      profile_picture: conv.other_profile_picture
    },
    last_message: conv.last_message || 'Pas de message',
    unread: Number(conv.unread),
    updated_at: conv.updated_at
  }));
};

// Get user conversations
router.get('/conversations', async (req, res) => {
  try {
    res.json(await getConversations(req.user.id));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a conversation (et les marque comme lus)
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!(await isParticipant(conversationId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [messages] = await pool.execute(`
      SELECT m.*, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.sent_at ASC, m.id ASC
    `, [conversationId]);

    await pool.execute(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id <> ? AND is_read = 0',
      [conversationId, userId]
    );

    res.json(messages.map(msg => formatMessage(msg, userId)));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const content = (req.body.content || '').trim();
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    if (!(await isParticipant(conversationId, userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, userId, content]
    );

    await pool.execute(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [conversationId]
    );

    const [newMessage] = await pool.execute(`
      SELECT m.*, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json(formatMessage(newMessage[0], userId));
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new conversation (par recipientId ou username)
router.post('/conversations', async (req, res) => {
  try {
    const { recipientId, username } = req.body;
    const userId = req.user.id;

    let recipient = null;
    if (recipientId) {
      [[recipient]] = await pool.execute('SELECT id FROM users WHERE id = ?', [recipientId]);
    } else if (username) {
      [[recipient]] = await pool.execute('SELECT id FROM users WHERE username = ?', [username.trim()]);
    }

    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (recipient.id === userId) {
      return res.status(400).json({ error: 'Valid recipient required' });
    }

    // Vérifier si une conversation existe déjà
    const [existing] = await pool.execute(
      'SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [userId, recipient.id, recipient.id, userId]
    );

    if (existing.length > 0) {
      return res.json({ conversationId: existing[0].id });
    }

    const [result] = await pool.execute(
      'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
      [userId, recipient.id]
    );

    res.status(201).json({ conversationId: result.insertId });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
