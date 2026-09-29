import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Send message
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { recipientId, subject, body } = req.body;
    const senderId = req.user.id;

    const result = await query(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [senderId, recipientId, subject, body]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get messages
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { type = 'inbox', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let sql;
    if (type === 'sent') {
      sql = 'SELECT * FROM messages WHERE sender_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    } else {
      sql = 'SELECT * FROM messages WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    }

    const result = await query(sql, [userId, limit, offset]);
    res.json({ messages: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
