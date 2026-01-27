import connectDB from '@/lib/mongodb';
import User from '@/models/userModel';
import Progress from '@/models/progressModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

const generateToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const { username, email, password, age } = await req.json();

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return Response.json({ message: 'User already exists' }, { status: 400 });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      age,
    });

    // Create initial progress records for each module
    const modules = ['python', 'javascript', 'html', 'css'];
    
    for (const module of modules) {
      await Progress.create({
        user: user._id,
        module,
      });
    }

    if (user) {
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
      }, { status: 201 });
    } else {
      return Response.json({ message: 'Invalid user data' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
