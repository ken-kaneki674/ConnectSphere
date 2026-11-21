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

// Get user conversations
const getConversationsHandler = async (req, res) => {
  try {
    const userId = req.user.id;

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json([
        {
          id: 1,
          user: { username: 'Alice', profile_picture: null },
          last_message: 'Salut !',
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          user: { username: 'Bob', profile_picture: null },
          last_message: 'À plus tard',
          updated_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    }

    const [conversations] = await pool.execute(`
      SELECT 
        c.id,
        c.updated_at,
        CASE 
          WHEN c.user1_id = ? THEN u2.username 
          ELSE u1.username 
        END as other_username,
        CASE 
          WHEN c.user1_id = ? THEN u2.profile_picture 
          ELSE u1.profile_picture 
        END as other_profile_picture,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.updated_at DESC
    `, [userId, userId, userId, userId]);

    res.json(conversations.map(conv => ({
      id: conv.id,
      user: { 
        username: conv.other_username, 
        profile_picture: conv.other_profile_picture 
      },
      last_message: conv.last_message || 'Pas de message',
      updated_at: conv.updated_at
    })));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

router.get('/conversations', authenticateToken, getConversationsHandler);
router.get('/', authenticateToken, getConversationsHandler);

// Get messages for a conversation
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json([
        { id: 1, content: 'Salut !', is_sender: false, created_at: new Date().toISOString() },
        { id: 2, content: 'Bonjour !', is_sender: true, created_at: new Date().toISOString() }
      ]);
    }

    // Vérifier que l'utilisateur participe à la conversation
    const [participants] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (participants.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [messages] = await pool.execute(`
      SELECT m.*, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

    res.json(messages.map(msg => ({
      ...msg,
      is_sender: msg.sender_id === userId
    })));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Pour le développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        id: Math.floor(Math.random() * 1000),
        content,
        sender_id: userId,
        created_at: new Date().toISOString()
      });
    }

    // Vérifier que l'utilisateur participe à la conversation
    const [participants] = await pool.execute(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (participants.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, userId, content]
    );

    // Update conversation timestamp
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
      is_sender: true
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    if (!recipientId || recipientId === userId) {
      return res.status(400).json({ error: 'Valid recipient required' });
    }

    // Vérifier si une conversation existe déjà
    const [existing] = await pool.execute(
      'SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [userId, recipientId, recipientId, userId]
    );

    if (existing.length > 0) {
      return res.json({ conversationId: existing[0].id });
    }

    // Créer nouvelle conversation
    const [result] = await pool.execute(
      'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
      [userId, recipientId]
    );

    res.status(201).json({ conversationId: result.insertId });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
