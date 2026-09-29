import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Create booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { serviceOfferingId, scheduledDate, duration, location, notes } = req.body;
    const buyerId = req.user.id;

    // Get service offering and seller info
    const serviceResult = await query(
      'SELECT so.*, s.user_id as seller_id FROM service_offerings so JOIN skills s ON so.skill_id = s.id WHERE so.id = $1',
      [serviceOfferingId]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Service offering not found'
        }
      });
    }

    const sellerId = serviceResult.rows[0].seller_id;

    const result = await query(
      'INSERT INTO bookings (service_offering_id, buyer_id, seller_id, scheduled_date, duration, location, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [serviceOfferingId, buyerId, sellerId, scheduledDate, duration, location, notes, 'pending']
    );

    res.status(201).json({ booking: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get bookings
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { role = 'buyer', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let sql;
    if (role === 'seller') {
      sql = 'SELECT * FROM bookings WHERE seller_id = $1 ORDER BY scheduled_date DESC LIMIT $2 OFFSET $3';
    } else {
      sql = 'SELECT * FROM bookings WHERE buyer_id = $1 ORDER BY scheduled_date DESC LIMIT $2 OFFSET $3';
    }

    const result = await query(sql, [userId, limit, offset]);
    res.json({ bookings: result.rows });
  } catch (error) {
    next(error);
  }
});

// Update booking status
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;
    const userId = req.user.id;

    // Check if user is involved in booking
    const checkResult = await query(
      'SELECT seller_id, buyer_id FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (checkResult.rows.length === 0 ||
        (checkResult.rows[0].seller_id !== userId && checkResult.rows[0].buyer_id !== userId)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this booking'
        }
      });
    }

    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, bookingId]
    );

    res.json({ booking: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
