import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  age?: number;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  avatar: {
    head: string;
    body: string;
    accessory: string;
    background: string;
  };
  inventory: mongoose.Types.ObjectId[];
  coins: number;
  experience: number;
  level: number;
  points: number;
  characterId: string;
  characterName: string;
  characterImage: string;
  characterAccessories: Array<{
    id: string;
    name: string;
    type: 'hat' | 'glasses' | 'tool' | 'pet' | 'badge';
    image: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    isEquipped: boolean;
    source: 'quiz' | 'adventure' | 'default' | 'store';
  }>;
  completedQuizzes: Array<{
    quiz: mongoose.Types.ObjectId;
    score: number;
    completedAt: Date;
  }>;
  matchPassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    age: {
      type: Number,
      required: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin'],
      default: 'student',
    },
    avatar: {
      head: {
        type: String,
        default: '👦',
      },
      body: {
        type: String,
        default: '👕',
      },
      accessory: {
        type: String,
        default: '',
      },
      background: {
        type: String,
        default: '#4ECDC4',
      },
    },
    inventory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    }],
    coins: {
      type: Number,
      default: 0,
    },
    experience: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 0,
    },
    characterId: {
      type: String,
      default: 'girl1',
    },
    characterName: {
      type: String,
      default: 'Coder',
    },
    characterImage: {
      type: String,
      default: '',
    },
    characterAccessories: [{
      id: String,
      name: String,
      type: {
        type: String,
        enum: ['hat', 'glasses', 'tool', 'pet', 'badge'],
      },
      image: String,
      description: String,
      rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      },
      isEquipped: {
        type: Boolean,
        default: false,
      },
      source: {
        type: String,
        enum: ['quiz', 'adventure', 'default', 'store'],
      },
    }],
    completedQuizzes: [{
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
      score: {
        type: Number,
        default: 0,
      },
      completedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
