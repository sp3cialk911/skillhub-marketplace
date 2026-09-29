import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Create review
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { revieweeId, rating, comment, entityType, entityId } = req.body;
    const reviewerId = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: {
          code: 'INVALID_RATING',
          message: 'Rating must be between 1 and 5'
        }
      });
    }

    const result = await query(
      'INSERT INTO reviews (reviewer_id, reviewee_id, rating, comment, related_entity_type, related_entity_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [reviewerId, revieweeId, rating, comment, entityType, entityId]
    );

    // Update average rating
    const avgResult = await query(
      'SELECT AVG(rating)::DECIMAL(3,2) as avg_rating FROM reviews WHERE reviewee_id = $1',
      [revieweeId]
    );

    res.status(201).json({ review: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get reviews for an entity
router.get('/', async (req, res, next) => {
  try {
    const { type, entityId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT r.*, u.first_name, u.last_name, u.avatar_url FROM reviews r JOIN users u ON r.reviewer_id = u.id';
    const params = [];

    if (type === 'user') {
      sql += ' WHERE r.reviewee_id = $1';
      params.push(entityId);
    } else {
      sql += ' WHERE r.related_entity_type = $1 AND r.related_entity_id = $2';
      params.push(type, entityId);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json({ reviews: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
