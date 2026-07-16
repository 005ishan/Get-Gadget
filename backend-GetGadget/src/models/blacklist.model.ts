import mongoose, { Schema, Document } from "mongoose";

export interface IBlacklist extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const BlacklistSchema = new Schema<IBlacklist>(
  {
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// TTL index: auto-delete blacklisted tokens after their expiry time
BlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistModel = mongoose.model<IBlacklist>(
  "Blacklist",
  BlacklistSchema
);
