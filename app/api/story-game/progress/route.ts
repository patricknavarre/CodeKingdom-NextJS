import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import jwt from 'jsonwebtoken';
import { SCENES, DECISION_POINTS } from '@/lib/storyGameConstants';
import { isChoiceAvailable } from '@/lib/storyGameUtils';

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
        health: 100,
        visitedLocations: ['forest_entrance'],
      });
    }
    
    // Backfill visitedLocations for existing saves so progress % is accurate
    if (!Array.isArray(storyGame.visitedLocations) || storyGame.visitedLocations.length === 0) {
      storyGame.visitedLocations = [storyGame.currentLocation];
      storyGame.markModified('visitedLocations');
      await storyGame.save();
    }
    
    // Get available items at current location
    const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
    // Type-safe access to locationItems
    const locationItems: string[] = (() => {
      const locationItemsObj = scene.locationItems as Record<string, string[]>;
      return locationItemsObj[storyGame.currentLocation] || [];
    })();
    const availableItems = locationItems.filter(itemName => {
      // Only show items that haven't been collected
      return !storyGame.inventory.some(invItem => invItem.name === itemName);
    });

    // Get available choices at current location (filter by flags / requiredChoice / requiredItem)
    const decisionPoint = DECISION_POINTS[storyGame.currentLocation];
    const storyGameForChoice = {
      inventory: storyGame.inventory,
      choices: storyGame.choices || [],
      storyFlags: storyGame.storyFlags || [],
    };
    const availableChoices = decisionPoint
      ? decisionPoint.choices
          .filter((choice) => isChoiceAvailable(choice, storyGameForChoice))
          .map((choice) => ({
            id: choice.id,
            description: choice.description,
            codeHint: choice.codeHint,
            requiredItem: choice.requiredItem,
            available: true,
          }))
      : [];
    
    // Compute progress from visited locations (accurate); fallback to stored value for old saves
    const totalLocations = Object.values(SCENES).reduce((sum, s) => sum + s.locations.length, 0);
    const visitedLocations = Array.isArray(storyGame.visitedLocations) ? storyGame.visitedLocations : [];
    const uniqueVisited = visitedLocations.filter((loc: string) =>
      Object.values(SCENES).some(scene => scene.locations.includes(loc))
    );
    const storyProgress = visitedLocations.length > 0
      ? Math.min(100, Math.round((uniqueVisited.length / totalLocations) * 100))
      : (storyGame.storyProgress ?? 0);
    
    return Response.json({
      currentScene: storyGame.currentScene,
      currentLocation: storyGame.currentLocation,
      inventory: storyGame.inventory.map(item => item.name),
      availableItems,
      availableChoices,
      choices: storyGame.choices || [],
      unlockedScenes: storyGame.unlockedScenes || [],
      storyProgress,
      health: storyGame.health ?? 100,
      completedScenes: storyGame.completedScenes,
      hintsUsed: storyGame.hintsUsed,
      storyFlags: storyGame.storyFlags || [],
      ending: storyGame.ending ?? null,
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized, token failed' }, { status: 401 });
    }
    return Response.json({ message: 'Server Error' }, { status: 500 });
  }
}
