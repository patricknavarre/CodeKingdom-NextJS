import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoryGame from '@/models/storyGameModel';
import { SCENES, MOVE_EVENTS, FOOD_ITEMS } from '@/lib/storyGameConstants';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

function resetToSceneStart(storyGame: any): string {
  const scene = SCENES[storyGame.currentScene as keyof typeof SCENES];
  return scene.locations[0];
}

/** POST body: { eventId: string, choiceId: string }. Applies event choice (damage, eat item/restore), then returns new health/inventory or death. */
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

    const { eventId, choiceId } = await req.json();
    if (!eventId || !choiceId || typeof eventId !== 'string' || typeof choiceId !== 'string') {
      return Response.json({ message: 'eventId and choiceId are required' }, { status: 400 });
    }

    const storyGame = await StoryGame.findOne({ user: userId });
    if (!storyGame) {
      return Response.json({ message: 'No story progress found' }, { status: 404 });
    }

    const event = MOVE_EVENTS[eventId];
    if (!event) {
      return Response.json({ message: 'Event not found' }, { status: 400 });
    }
    const choice = event.choices.find((c: { id: string }) => c.id === choiceId);
    if (!choice) {
      return Response.json({ message: 'Choice not found' }, { status: 400 });
    }

    let health = storyGame.health ?? 100;

    if (choice.damage != null) {
      health = Math.max(0, health - choice.damage);
    }
    if (choice.eatItem) {
      const inv = storyGame.inventory;
      const idx = inv.findIndex((i) => i.name === choice.eatItem);
      if (idx === -1) {
        return Response.json({ message: 'You do not have that item' }, { status: 400 });
      }
      inv.splice(idx, 1);
      storyGame.markModified('inventory');
      const restore = choice.healthRestore ?? FOOD_ITEMS[choice.eatItem] ?? 0;
      health = Math.min(100, health + restore);
    }
    if (choice.healthRestore != null && !choice.eatItem) {
      health = Math.min(100, health + choice.healthRestore);
    }

    storyGame.health = health;
    storyGame.markModified('health');

    if (health <= 0) {
      const resetLocation = resetToSceneStart(storyGame);
      storyGame.currentLocation = resetLocation;
      storyGame.isDead = true;
      storyGame.deathCount = (storyGame.deathCount || 0) + 1;
      storyGame.lastDeathLocation = storyGame.currentLocation;
      storyGame.health = 100;
      storyGame.isDead = false;
      storyGame.lastActive = new Date();
      await storyGame.save();
      return Response.json({
        success: false,
        action: 'death',
        message: 'You have run out of health!',
        deathMessage: 'You have run out of health! You wake up at the start of the scene.',
        newLocation: resetLocation,
        newScene: storyGame.currentScene,
        newInventory: storyGame.inventory.map((i: { name: string }) => i.name),
        deathCount: storyGame.deathCount,
      });
    }

    storyGame.lastActive = new Date();
    await storyGame.save();

    return Response.json({
      success: true,
      health: storyGame.health,
      newInventory: storyGame.inventory.map((i: { name: string }) => i.name),
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized' }, { status: 401 });
    }
    console.error('resolve-event error:', error);
    return Response.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
