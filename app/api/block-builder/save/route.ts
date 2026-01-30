import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlockBuild from '@/models/blockBuildModel';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { blocks, currentChallenge } = body;

    // Validate blocks array
    if (!Array.isArray(blocks)) {
      return NextResponse.json({ message: 'Invalid blocks data' }, { status: 400 });
    }

    // Save or update block build
    const blockBuild = await BlockBuild.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        blocks: blocks,
        currentChallenge: currentChallenge || 0,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Block build saved successfully',
      blockBuild: {
        blocks: blockBuild.blocks,
        currentChallenge: blockBuild.currentChallenge
      }
    });
  } catch (error: any) {
    console.error('Error saving block build:', error);
    return NextResponse.json(
      { message: 'Server Error', error: error.message },
      { status: 500 }
    );
  }
}
