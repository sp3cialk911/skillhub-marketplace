import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, avatar_url, bio, location, roles, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { firstName, lastName, bio, location } = req.body;
    const userId = req.user.id;

    const result = await query(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), bio = COALESCE($3, bio), location = COALESCE($4, location), updated_at = NOW() WHERE id = $5 RETURNING id, email, first_name, last_name, avatar_url, bio, location, roles',
      [firstName, lastName, bio, location, userId]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get public profile
router.get('/:id/public', async (req, res, next) => {
  try {
    const userResult = await query(
      'SELECT id, first_name, last_name, avatar_url, bio, location, roles, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = userResult.rows[0];

    // Get user's products
    const productsResult = await query(
      'SELECT id, title, price, rating FROM products WHERE creator_id = $1 AND is_published = true LIMIT 10',
      [req.params.id]
    );

    // Get user's courses
    const coursesResult = await query(
      'SELECT id, title, price, rating FROM courses WHERE instructor_id = $1 AND is_published = true LIMIT 10',
      [req.params.id]
    );

    // Get user's skills
    const skillsResult = await query(
      'SELECT id, skill_name, category, hourly_rate, rating FROM skills WHERE user_id = $1 AND is_available = true',
      [req.params.id]
    );

    // Get user's reviews
    const reviewsResult = await query(
      'SELECT * FROM reviews WHERE reviewee_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.params.id]
    );

    res.json({
      user,
      products: productsResult.rows,
      courses: coursesResult.rows,
      skills: skillsResult.rows,
      reviews: reviewsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
