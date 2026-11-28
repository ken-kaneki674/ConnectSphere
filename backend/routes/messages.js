const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const store = require('../utils/devStore');

const router = express.Router();

const formatDevConversation = (conv, userId) => {
  const otherId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
  const otherUser = store.users.find((u) => u.id === otherId) || { id: otherId, username: 'Membre', profile_picture: null };
  const convMsgs = store.messages
    .filter((m) => m.conversation_id === conv.id)
    .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at) || a.id - b.id);
  const lastMsg = convMsgs[convMsgs.length - 1];
  const unreadCount = convMsgs.filter((m) => m.sender_id !== userId && !m.is_read).length;

  return {
    id: conv.id,
    user: {
      id: otherUser.id,
      username: otherUser.username,
      profile_picture: otherUser.profile_picture,
      is_online: otherUser.id === 2 || otherUser.id === 4,
    },
    last_message: lastMsg ? lastMsg.content : 'Nouvelle conversation',
    unread_count: unreadCount,
    updated_at: conv.updated_at,
  };
};

// Get user conversations
const getConversationsHandler = async (req, res) => {
  try {
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const list = store.conversations
        .filter((c) => c.user1_id === userId || c.user2_id === userId)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .map((c) => formatDevConversation(c, userId));
      return res.json(list);
    }

    const [conversations] = await pool.execute(`
      SELECT 
        c.id,
        c.updated_at,
        CASE WHEN c.user1_id = ? THEN u2.id ELSE u1.id END AS other_id,
        CASE WHEN c.user1_id = ? THEN u2.username ELSE u1.username END AS other_username,
        CASE WHEN c.user1_id = ? THEN u2.profile_picture ELSE u1.profile_picture END AS other_profile_picture,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC, id DESC LIMIT 1) AS last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread_count
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.updated_at DESC
    `, [userId, userId, userId, userId, userId, userId]);

    res.json(conversations.map((conv) => ({
      id: conv.id,
      user: {
        id: conv.other_id,
        username: conv.other_username,
        profile_picture: conv.other_profile_picture,
      },
      last_message: conv.last_message || 'Pas de message',
      unread_count: Number(conv.unread_count || 0),
      updated_at: conv.updated_at,
    })));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

router.get('/conversations', authenticateToken, getConversationsHandler);
router.get('/', authenticateToken, getConversationsHandler);

// Get messages for a conversation (and mark incoming messages read)
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const userId = req.user.id;

    if (store.isDevFallback()) {
      const conv = store.conversations.find(
        (c) => c.id === conversationId && (c.user1_id === userId || c.user2_id === userId)
      );
      if (!conv) return res.status(403).json({ error: 'Access denied' });

      const list = store.messages
        .filter((m) => m.conversation_id === conversationId)
        .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at) || a.id - b.id)
        .map((m) => {
          if (m.sender_id !== userId) m.is_read = true;
          return {
            ...m,
            is_sender: m.sender_id === userId,
          };
        });
      return res.json(list);
    }

    const [participants] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (participants.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.execute(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ? AND is_read = 0',
      [conversationId, userId]
    );

    const [messages] = await pool.execute(`
      SELECT m.*, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.sent_at ASC, m.id ASC
    `, [conversationId]);

    res.json(messages.map((msg) => ({
      ...msg,
      is_sender: msg.sender_id === userId,
    })));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const cleanContent = (req.body.content || '').trim();
    const userId = req.user.id;

    if (!cleanContent) {
      return res.status(400).json({ error: 'Content required' });
    }

    if (store.isDevFallback()) {
      const conv = store.conversations.find(
        (c) => c.id === conversationId && (c.user1_id === userId || c.user2_id === userId)
      );
      if (!conv) return res.status(403).json({ error: 'Access denied' });

      const newMsg = {
        id: store.genId(),
        conversation_id: conversationId,
        sender_id: userId,
        content: cleanContent,
        is_read: false,
        sent_at: new Date().toISOString(),
      };
      store.messages.push(newMsg);
      conv.updated_at = newMsg.sent_at;
      return res.status(201).json({ ...newMsg, is_sender: true });
    }

    const [participants] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (participants.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, userId, cleanContent]
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

    res.status(201).json({
      ...newMessage[0],
      is_sender: true,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or get existing conversation with a user
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const recipientId = Number(req.body.recipientId);
    const userId = req.user.id;

    if (!recipientId || recipientId === userId) {
      return res.status(400).json({ error: 'Valid recipient required' });
    }

    if (store.isDevFallback()) {
      let conv = store.conversations.find(
        (c) => (c.user1_id === userId && c.user2_id === recipientId) || (c.user1_id === recipientId && c.user2_id === userId)
      );
      if (!conv) {
        const now = new Date().toISOString();
        conv = { id: store.genId(), user1_id: userId, user2_id: recipientId, created_at: now, updated_at: now };
        store.conversations.unshift(conv);
      }
      return res.status(201).json({ conversationId: conv.id, conversation: formatDevConversation(conv, userId) });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [userId, recipientId, recipientId, userId]
    );

    let conversationId;
    if (existing.length > 0) {
      conversationId = existing[0].id;
    } else {
      const [result] = await pool.execute(
        'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
        [userId, recipientId]
      );
      conversationId = result.insertId;
    }

    const [rows] = await pool.execute('SELECT id, username, profile_picture FROM users WHERE id = ?', [recipientId]);
    res.status(201).json({
      conversationId,
      conversation: {
        id: conversationId,
        user: rows[0] || { id: recipientId, username: 'Membre', profile_picture: null },
        last_message: 'Nouvelle conversation',
        unread_count: 0,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
