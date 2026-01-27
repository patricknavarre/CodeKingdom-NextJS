import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import User from '@/models/userModel';
import { SCENES } from '@/lib/storyGameConstants';
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

    const { hintLevel } = await req.json(); // 1, 2, or 3
    
    if (!hintLevel || ![1, 2, 3].includes(hintLevel)) {
      return Response.json({ message: 'Hint level must be 1, 2, or 3' }, { status: 400 });
    }
    
    // Get story game progress
    let storyGame = await StoryGame.findOne({ user: userId });
    if (!storyGame) {
      storyGame = await StoryGame.create({
        user: userId,
        currentScene: 'forest',
        currentLocation: 'forest_entrance',
        inventory: [],
      });
    }
    
    // Get current scene hints
    const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
    const hint = scene.hints[hintLevel as keyof typeof scene.hints];
    
    if (!hint) {
      return Response.json({ message: 'Invalid hint level for current scene' }, { status: 400 });
    }
    
    // Check user coins
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.coins < hint.cost) {
      return Response.json({ message: `Not enough coins! You need ${hint.cost} coins.` }, { status: 400 });
    }
    
    // Deduct coins
    user.coins -= hint.cost;
    await user.save();
    
    // Record hint usage
    storyGame.hintsUsed.push({
      scene: storyGame.currentScene,
      hintLevel,
      cost: hint.cost,
      usedAt: new Date(),
    });
    storyGame.totalHintsPurchased += 1;
    storyGame.totalCoinsSpentOnHints += hint.cost;
    await storyGame.save();
    
    return Response.json({
      hint: hint.text,
      cost: hint.cost,
      remainingCoins: user.coins,
      hintLevel,
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized, token failed' }, { status: 401 });
    }
    return Response.json({ message: 'Server Error' }, { status: 500 });
  }
}
