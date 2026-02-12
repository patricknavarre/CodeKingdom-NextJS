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
  health?: number; // 0-100, default 100; damage from move events, restore from food
  choices: Array<{
    scene: string;
    location: string;
    choice: string; // e.g., "path_a", "path_b", "help_merchant", etc.
    chosenAt: Date;
  }>;
  unlockedScenes: string[]; // Scenes unlocked through choices
  visitedLocations: string[]; // All locations the player has ever been to (for progress %)
  hintsUsed: Array<{
    scene: string;
    hintLevel: number; // 1, 2, or 3
    cost: number;
    usedAt: Date;
  }>;
  totalHintsPurchased: number;
  totalCoinsSpentOnHints: number;
  isDead?: boolean;
  deathCount?: number;
  lastDeathLocation?: string;
  dragonHypnotized?: boolean;
  dragonDefeated?: boolean;
  storyFlags?: string[]; // e.g. ["helped_merchant"] - set by choices, used for conditional content
  ending?: string; // ending id when player reaches an ending
  endingReachedAt?: Date;
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
    health: {
      type: Number,
      default: 100,
    },
    choices: [{
      scene: String,
      location: String,
      choice: String,
      chosenAt: {
        type: Date,
        default: Date.now,
      },
    }],
    unlockedScenes: [{
      type: String,
    }],
    visitedLocations: [{
      type: String,
    }],
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
    isDead: {
      type: Boolean,
      default: false,
    },
    deathCount: {
      type: Number,
      default: 0,
    },
    lastDeathLocation: {
      type: String,
    },
    dragonHypnotized: {
      type: Boolean,
      default: false,
    },
    dragonDefeated: {
      type: Boolean,
      default: false,
    },
    storyFlags: [{
      type: String,
    }],
    ending: {
      type: String,
    },
    endingReachedAt: {
      type: Date,
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
