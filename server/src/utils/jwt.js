import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your_secret_key';
const EXPIRE = process.env.JWT_EXPIRE || '7d';
const REFRESH_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '30d';

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRE });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXPIRE });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
