import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, sort = '-created_at' } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM products WHERE is_published = true';
    const params = [];

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
    const countResult = await query('SELECT COUNT(*) FROM products WHERE is_published = true');

    res.json({
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    res.json({ product: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Create product (seller only)
router.post('/', authenticate, requireRole(['seller', 'instructor']), async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;
    const creatorId = req.user.id;

    const result = await query(
      'INSERT INTO products (creator_id, title, description, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [creatorId, title, description, price, category]
    );

    // Add seller role if not already present
    await query(
      "UPDATE users SET roles = array_append(roles, 'seller') WHERE id = $1 AND NOT 'seller' = ANY(roles)",
      [creatorId]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update product
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, category } = req.body;

    // Check ownership
    const checkResult = await query('SELECT creator_id FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0 || checkResult.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this product'
        }
      });
    }

    const result = await query(
      'UPDATE products SET title = $1, description = $2, price = $3, category = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, description, price, category, id]
    );

    res.json({ product: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Publish product
router.post('/:id/publish', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const checkResult = await query('SELECT creator_id FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0 || checkResult.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to publish this product'
        }
      });
    }

    const result = await query(
      'UPDATE products SET is_published = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ product: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
