import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import User from '../models/userModel';
import connectDB from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

export interface AuthRequest extends NextApiRequest {
  user?: any;
}

export async function protect(req: AuthRequest, res: NextApiResponse, next: () => void) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

      // Connect to DB
      await connectDB();

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
}
