import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// Create payment intent
router.post('/intent', authenticate, async (req, res, next) => {
  try {
    const { amount, currency = 'USD', type, entityId } = req.body;
    const userId = req.user.id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: {
        userId,
        type,
        entityId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
});

// Confirm payment
router.post('/confirm', authenticate, async (req, res, next) => {
  try {
    const { paymentIntentId, type, entityId } = req.body;
    const userId = req.user.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: {
          code: 'PAYMENT_FAILED',
          message: 'Payment was not successful'
        }
      });
    }

    // Create order record
    const orderResult = await query(
      'INSERT INTO orders (user_id, order_type, related_entity_id, amount, status, stripe_payment_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, type, entityId, paymentIntent.amount / 100, 'completed', paymentIntentId]
    );

    // Handle based on type
    if (type === 'course') {
      await query(
        'INSERT INTO enrollments (course_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [entityId, userId]
      );
    }

    res.json({ order: orderResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
