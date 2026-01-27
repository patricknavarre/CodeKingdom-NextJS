import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ message: 'Not authorized, no token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;

    const storyGame = await StoryGame.findOne({ user: userId });
    
    if (storyGame) {
      storyGame.currentScene = 'forest';
      storyGame.currentLocation = 'forest_entrance';
      storyGame.inventory = [];
      storyGame.completedScenes = [];
      storyGame.storyProgress = 0;
      await storyGame.save();
    }
    
    return Response.json({ message: 'Story game progress reset successfully' });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized, token failed' }, { status: 401 });
    }
    return Response.json({ message: 'Server Error' }, { status: 500 });
  }
}
