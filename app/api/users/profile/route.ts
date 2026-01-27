import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/userModel';
import { protect } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ message: 'Not authorized, no token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    return Response.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      age: user.age,
      role: user.role,
      avatar: user.avatar,
      coins: user.coins,
      experience: user.experience,
      level: user.level,
      points: user.points,
      characterId: user.characterId,
      characterName: user.characterName,
      characterImage: user.characterImage,
      characterAccessories: user.characterAccessories,
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized, token failed' }, { status: 401 });
    }
    return Response.json({ message: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    // Get token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ message: 'Not authorized, no token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    
    // Update user fields
    if (body.coins !== undefined) user.coins = body.coins;
    if (body.experience !== undefined) user.experience = body.experience;
    if (body.level !== undefined) user.level = body.level;
    if (body.points !== undefined) user.points = body.points;
    if (body.characterId !== undefined) user.characterId = body.characterId;
    if (body.characterName !== undefined) user.characterName = body.characterName;
    if (body.characterImage !== undefined) user.characterImage = body.characterImage;
    if (body.characterAccessories !== undefined) user.characterAccessories = body.characterAccessories;

    const updatedUser = await user.save();

    return Response.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      age: updatedUser.age,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      coins: updatedUser.coins,
      experience: updatedUser.experience,
      level: updatedUser.level,
      points: updatedUser.points,
      characterId: updatedUser.characterId,
      characterName: updatedUser.characterName,
      characterImage: updatedUser.characterImage,
      characterAccessories: updatedUser.characterAccessories,
    });
  } catch (error: any) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return Response.json({ message: 'Not authorized, token failed' }, { status: 401 });
    }
    return Response.json({ message: 'Server Error' }, { status: 500 });
  }
}
