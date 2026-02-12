import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import User from '@/models/userModel';
import { SCENES } from '@/lib/storyGameConstants';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

/** POST body: { item: string }. Called after user passes the collect-item quiz; adds item to inventory and grants coins/XP. */
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

    const { item } = await req.json();
    if (!item || typeof item !== 'string') {
      return Response.json({ message: 'item is required' }, { status: 400 });
    }

    const storyGame = await StoryGame.findOne({ user: userId });
    if (!storyGame) {
      return Response.json({ message: 'No story progress found' }, { status: 404 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
    if (!scene) {
      return Response.json({ message: 'Invalid scene' }, { status: 400 });
    }
    const checkLocation = storyGame.currentLocation;
    const locationItems: string[] = (() => {
      const locationItemsObj = scene.locationItems as Record<string, string[]>;
      return locationItemsObj[checkLocation] || [];
    })();

    if (!scene.items.includes(item)) {
      return Response.json({ message: `A ${item} is not available in this scene.` }, { status: 400 });
    }
    if (!locationItems.includes(item)) {
      return Response.json({ message: `A ${item} is not available at this location.` }, { status: 400 });
    }
    const alreadyCollected = storyGame.inventory.some((inv: { name: string }) => inv.name === item);
    if (alreadyCollected) {
      return Response.json({ message: `You already have a ${item}!` }, { status: 400 });
    }

    storyGame.inventory.push({
      name: item,
      description: `A ${item} found in the ${storyGame.currentScene}.`,
      collectedAt: new Date(),
    });
    if (item === 'crown') {
      if (!storyGame.storyFlags) storyGame.storyFlags = [];
      if (!storyGame.storyFlags.includes('found_crown')) storyGame.storyFlags.push('found_crown');
    }
    await storyGame.save();

    const coinsEarned = 15;
    const experienceEarned = 20;
    user.coins += coinsEarned;
    user.experience += experienceEarned;
    if (user.experience >= user.level * 100) {
      user.level += 1;
      user.coins += 50;
    }
    await user.save();

    return Response.json({
      success: true,
      message: `You collected a ${item}! 🎉`,
      newInventory: storyGame.inventory.map((i: { name: string }) => i.name),
      coinsEarned,
      experienceEarned,
      userCoins: user.coins,
      userExperience: user.experience,
      userLevel: user.level,
      storyProgress: storyGame.storyProgress,
      collectedItem: item,
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized' }, { status: 401 });
    }
    console.error('confirm-collect error:', error);
    return Response.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
