import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  module: 'python' | 'javascript' | 'html' | 'css';
  level: number;
  completedLessons: Array<{
    lessonId: mongoose.Types.ObjectId;
    score: number;
    completedAt: Date;
  }>;
  stars: number;
  badges: string[];
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    module: {
      type: String,
      required: true,
      enum: ['python', 'javascript', 'html', 'css'],
    },
    level: {
      type: Number,
      required: true,
      default: 1,
    },
    completedLessons: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
        },
        score: {
          type: Number,
          default: 0,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stars: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: String,
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Progress: Model<IProgress> = mongoose.models.Progress || mongoose.model<IProgress>('Progress', progressSchema);

export default Progress;
