const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, signToken } = require('../middleware/auth');
const store = require('../utils/devStore');

const router = express.Router();

const buildDevUserPayload = (user) => ({
  ...store.sanitizeUser(user),
  ...store.getUserCounts(user.id),
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    }

    const identifier = String(username).trim();

    if (store.isDevFallback()) {
      const found = store.users.find(
        (u) => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()
      );
      if (!found || !bcrypt.compareSync(password, found.passwordHash)) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
      const userPayload = buildDevUserPayload(found);
      const token = signToken(userPayload);
      return res.json({ user: userPayload, token });
    }

    try {
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
        [identifier, identifier]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      const token = signToken(user);
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          bio: user.bio || '',
          profile_picture: user.profile_picture || null,
        },
        token,
      });
    } catch (dbErr) {
      if (store.isDevFallback(dbErr)) {
        const found = store.users.find(
          (u) => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()
        );
        if (!found || !bcrypt.compareSync(password, found.passwordHash)) {
          return res.status(401).json({ error: 'Identifiants invalides' });
        }
        const userPayload = buildDevUserPayload(found);
        return res.json({ user: userPayload, token: signToken(userPayload) });
      }
      throw dbErr;
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const cleanUser = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (String(password).length < 4) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 4 caractères' });
    }

    if (store.isDevFallback()) {
      const exists = store.users.some(
        (u) => u.username.toLowerCase() === cleanUser.toLowerCase() || u.email.toLowerCase() === cleanEmail
      );
      if (exists) {
        return res.status(409).json({ error: 'Ce nom d’utilisateur ou cet email est déjà utilisé' });
      }
      const newUser = {
        id: store.genId(),
        username: cleanUser,
        email: cleanEmail,
        passwordHash: await bcrypt.hash(password, 10),
        bio: 'Nouveau membre sur ConnectSphere 🌐',
        profile_picture: null,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      store.users.push(newUser);
      const userPayload = buildDevUserPayload(newUser);
      return res.status(201).json({
        message: 'Compte créé avec succès',
        user: userPayload,
        token: signToken(userPayload),
      });
    }

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [cleanUser, cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Ce nom d’utilisateur ou cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [cleanUser, cleanEmail, hashedPassword]
    );

    const userPayload = { id: result.insertId, username: cleanUser, email: cleanEmail, bio: '', profile_picture: null };
    res.status(201).json({
      message: 'Compte créé avec succès',
      user: userPayload,
      token: signToken(userPayload),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (store.isDevFallback()) {
      const found = store.users.find((u) => u.id === req.user.id);
      if (!found) return res.status(404).json({ error: 'User not found' });
      return res.json(buildDevUserPayload(found));
    }

    const [users] = await pool.execute(`
      SELECT u.id, u.username, u.email, u.bio, u.profile_picture, u.created_at,
             (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
             (SELECT COUNT(*) FROM group_members WHERE user_id = u.id) AS groups_count,
             (SELECT COUNT(*) FROM friend_requests WHERE status = 1 AND (sender_id = u.id OR receiver_id = u.id)) AS friends_count
      FROM users u
      WHERE u.id = ?
    `, [req.user.id]);

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
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
