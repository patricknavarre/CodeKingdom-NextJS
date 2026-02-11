import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

/** POST body: { flag: string }. Pushes flag to storyFlags if not already present. Used for minigame completion. */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ message: 'Not authorized, no token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;
    const { flag } = await req.json();
    if (!flag || typeof flag !== 'string') {
      return Response.json({ message: 'flag is required' }, { status: 400 });
    }
    let storyGame = await StoryGame.findOne({ user: userId });
    if (!storyGame) {
      return Response.json({ message: 'No story progress found' }, { status: 404 });
    }
    if (!storyGame.storyFlags) storyGame.storyFlags = [];
    if (!storyGame.storyFlags.includes(flag)) {
      storyGame.storyFlags.push(flag);
      storyGame.markModified('storyFlags');
      await storyGame.save();
    }
    return Response.json({ storyFlags: storyGame.storyFlags });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized' }, { status: 401 });
    }
    console.error('set-flag error:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
