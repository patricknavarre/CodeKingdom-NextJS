import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoryGame extends Document {
  user: mongoose.Types.ObjectId;
  currentScene: 'forest' | 'castle' | 'town' | 'ocean' | 'mountain' | 'desert';
  currentLocation: string;
  inventory: Array<{
    name: string;
    description?: string;
    collectedAt: Date;
  }>;
  completedScenes: Array<{
    scene: 'forest' | 'castle' | 'town' | 'ocean' | 'mountain' | 'desert';
    completedAt: Date;
  }>;
  storyProgress: number; // 0-100 percentage
  hintsUsed: Array<{
    scene: string;
    hintLevel: number; // 1, 2, or 3
    cost: number;
    usedAt: Date;
  }>;
  totalHintsPurchased: number;
  totalCoinsSpentOnHints: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storyGameSchema = new Schema<IStoryGame>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    currentScene: {
      type: String,
      enum: ['forest', 'castle', 'town', 'ocean', 'mountain', 'desert'],
      default: 'forest',
    },
    currentLocation: {
      type: String,
      default: 'forest_entrance',
    },
    inventory: [{
      name: {
        type: String,
        required: true,
      },
      description: String,
      collectedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    completedScenes: [{
      scene: {
        type: String,
        enum: ['forest', 'castle', 'town', 'ocean', 'mountain', 'desert'],
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    storyProgress: {
      type: Number,
      default: 0, // 0-100 percentage
    },
    hintsUsed: [{
      scene: String,
      hintLevel: Number, // 1, 2, or 3 (progressive detail)
      cost: Number,
      usedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    totalHintsPurchased: {
      type: Number,
      default: 0,
    },
    totalCoinsSpentOnHints: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one story game progress per user
storyGameSchema.index({ user: 1 }, { unique: true });

const StoryGame: Model<IStoryGame> = mongoose.models.StoryGame || mongoose.model<IStoryGame>('StoryGame', storyGameSchema);

export default StoryGame;
