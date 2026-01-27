import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlockBuild from '@/models/blockBuildModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user from token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;

    // Load block build
    const blockBuild = await BlockBuild.findOne({ user: userId });

    if (!blockBuild) {
      // Return empty build if none exists
      return NextResponse.json({
        success: true,
        blocks: [],
        currentChallenge: 0
      });
    }

    return NextResponse.json({
      success: true,
      blocks: blockBuild.blocks,
      currentChallenge: blockBuild.currentChallenge
    });
  } catch (error: any) {
    console.error('Error loading block build:', error);
    return NextResponse.json(
      { message: 'Server Error', error: error.message },
      { status: 500 }
    );
  }
}
