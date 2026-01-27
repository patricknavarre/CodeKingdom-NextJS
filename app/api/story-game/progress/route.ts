import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import jwt from 'jsonwebtoken';
import { SCENES } from '@/lib/storyGameConstants';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

export async function GET(req: NextRequest) {
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

    let storyGame = await StoryGame.findOne({ user: userId });
    
    if (!storyGame) {
      // Create new story game progress
      storyGame = await StoryGame.create({
        user: userId,
        currentScene: 'forest',
        currentLocation: 'forest_entrance',
        inventory: [],
        storyProgress: 0,
      });
    }
    
    // Get available items at current location
    const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
    const locationItems = scene.locationItems[storyGame.currentLocation] || [];
    const availableItems = locationItems.filter(itemName => {
      // Only show items that haven't been collected
      return !storyGame.inventory.some(invItem => invItem.name === itemName);
    });

    return Response.json({
      currentScene: storyGame.currentScene,
      currentLocation: storyGame.currentLocation,
      inventory: storyGame.inventory.map(item => item.name),
      availableItems,
      storyProgress: storyGame.storyProgress,
      completedScenes: storyGame.completedScenes,
      hintsUsed: storyGame.hintsUsed,
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized, token failed' }, { status: 401 });
    }
    return Response.json({ message: 'Server Error' }, { status: 500 });
  }
}
