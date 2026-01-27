import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockBuild extends Document {
  user: mongoose.Types.ObjectId;
  blocks: Array<{
    x: number;
    y: number;
    z: number;
    color: string;
  }>;
  currentChallenge: number;
  lastUpdated: Date;
}

const BlockBuildSchema = new Schema<IBlockBuild>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  blocks: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true },
    color: { type: String, required: true, default: 'red' }
  }],
  currentChallenge: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated on save
(BlockBuildSchema as any).pre('save', function(this: IBlockBuild, next: mongoose.CallbackWithoutResult) {
  this.lastUpdated = new Date();
  next(undefined);
});

export default mongoose.models.BlockBuild || mongoose.model<IBlockBuild>('BlockBuild', BlockBuildSchema);
