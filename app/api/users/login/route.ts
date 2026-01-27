import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

const generateToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await req.json();

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
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
        token: generateToken(user._id.toString()),
      });
    } else {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error: any) {
    console.error(error);
    return Response.json({ message: 'Server Error' }, { status: 500 });
  }
}
