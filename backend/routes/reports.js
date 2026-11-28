const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const store = require('../utils/devStore');

const router = express.Router();

// Create a moderation report for a post or user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { target_type, target_id, reason } = req.body;
    const cleanReason = (reason || '').trim();

    if (!['user', 'post'].includes(target_type) || !target_id || !cleanReason) {
      return res.status(400).json({ error: 'target_type (user|post), target_id et reason sont requis' });
    }

    if (store.isDevFallback()) {
      const report = {
        id: store.genId(),
        reporter_id: reporterId,
        target_type,
        target_id: Number(target_id),
        reason: cleanReason,
        created_at: new Date().toISOString(),
      };
      store.reports.unshift(report);
      return res.status(201).json({ message: 'Signalement envoyé', report });
    }

    const [result] = await pool.execute(
      'INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)',
      [reporterId, target_type, Number(target_id), cleanReason]
    );

    res.status(201).json({
      message: 'Signalement envoyé',
      report: { id: result.insertId, reporter_id: reporterId, target_type, target_id: Number(target_id), reason: cleanReason },
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// List reports submitted by the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    if (store.isDevFallback()) {
      return res.json(store.reports.filter((r) => r.reporter_id === userId));
    }

    const [rows] = await pool.execute(
      'SELECT * FROM reports WHERE reporter_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
