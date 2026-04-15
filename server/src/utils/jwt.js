import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(user) {
  return jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '7d' });
}
