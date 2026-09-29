import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// List skills (local marketplace)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, location, sort = '-rating' } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT s.*, u.first_name, u.last_name, u.location FROM skills s JOIN users u ON s.user_id = u.id WHERE s.is_available = true';
    const params = [];

    if (category) {
      sql += ' AND s.category = $' + (params.length + 1);
      params.push(category);
    }

    if (search) {
      sql += ' AND (s.skill_name ILIKE $' + (params.length + 1) + ' OR s.description ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    if (location) {
      sql += ' AND u.location ILIKE $' + (params.length + 1);
      params.push(`%${location}%`);
    }

    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
    sql += ` ORDER BY s.${sortField} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query('SELECT COUNT(*) FROM skills WHERE is_available = true');

    res.json({
      skills: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get skill profile
router.get('/:id', async (req, res, next) => {
  try {
    const skillResult = await query(
      'SELECT s.*, u.first_name, u.last_name, u.avatar_url, u.location FROM skills s JOIN users u ON s.user_id = u.id WHERE s.id = $1',
      [req.params.id]
    );

    if (skillResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Skill not found'
        }
      });
    }

    const offeringsResult = await query(
      'SELECT * FROM service_offerings WHERE skill_id = $1 AND is_active = true',
      [req.params.id]
    );

    const reviewsResult = await query(
      'SELECT r.*, u.first_name, u.last_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.reviewee_id = $1 ORDER BY r.created_at DESC LIMIT 10',
      [skillResult.rows[0].user_id]
    );

    res.json({
      skill: skillResult.rows[0],
      offerings: offeringsResult.rows,
      reviews: reviewsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create skill profile
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { skillName, description, category, proficiencyLevel, hourlyRate } = req.body;
    const userId = req.user.id;

    const result = await query(
      'INSERT INTO skills (user_id, skill_name, description, category, proficiency_level, hourly_rate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, skillName, description, category, proficiencyLevel, hourlyRate]
    );

    // Add skill_trader role
    await query(
      "UPDATE users SET roles = array_append(roles, 'skill_trader') WHERE id = $1 AND NOT 'skill_trader' = ANY(roles)",
      [userId]
    );

    res.status(201).json({ skill: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update skill availability
router.put('/:id/availability', authenticate, async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const skillId = req.params.id;

    // Check ownership
    const checkResult = await query('SELECT user_id FROM skills WHERE id = $1', [skillId]);
    if (checkResult.rows.length === 0 || checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this skill'
        }
      });
    }

    const result = await query(
      'UPDATE skills SET is_available = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isAvailable, skillId]
    );

    res.json({ skill: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
