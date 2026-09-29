import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, level, category, search, sort = '-created_at' } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM courses WHERE is_published = true';
    const params = [];

    if (level) {
      sql += ' AND level = $' + (params.length + 1);
      params.push(level);
    }

    if (category) {
      sql += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (search) {
      sql += ' AND (title ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query('SELECT COUNT(*) FROM courses WHERE is_published = true');

    res.json({
      courses: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get course by ID with lessons
router.get('/:id', async (req, res, next) => {
  try {
    const courseResult = await query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    const lessonsResult = await query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY lesson_order ASC',
      [req.params.id]
    );

    res.json({
      course: courseResult.rows[0],
      lessons: lessonsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create course (instructor only)
router.post('/', authenticate, requireRole(['instructor']), async (req, res, next) => {
  try {
    const { title, description, price, category, level = 'beginner' } = req.body;
    const instructorId = req.user.id;

    const result = await query(
      'INSERT INTO courses (instructor_id, title, description, price, category, level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [instructorId, title, description, price, category, level]
    );

    // Add instructor role if not already present
    await query(
      "UPDATE users SET roles = array_append(roles, 'instructor') WHERE id = $1 AND NOT 'instructor' = ANY(roles)",
      [instructorId]
    );

    res.status(201).json({ course: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Enroll in course
router.post('/:id/enroll', authenticate, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Check if already enrolled
    const checkResult = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        error: {
          code: 'ALREADY_ENROLLED',
          message: 'Already enrolled in this course'
        }
      });
    }

    const result = await query(
      'INSERT INTO enrollments (course_id, user_id) VALUES ($1, $2) RETURNING *',
      [courseId, userId]
    );

    // Add student role if not already present
    await query(
      "UPDATE users SET roles = array_append(roles, 'student') WHERE id = $1 AND NOT 'student' = ANY(roles)",
      [userId]
    );

    res.status(201).json({ enrollment: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get enrollment progress
router.get('/:id/enrollment', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM enrollments WHERE course_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_ENROLLED',
          message: 'Not enrolled in this course'
        }
      });
    }

    res.json({ enrollment: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
