  import mongoose, { Schema, Document } from "mongoose";
  import { GadgetCategory } from "../types/common.type";

  export interface IProduct extends Document {
    name: string;
    price: number;
    imageUrl?: string;
    category: GadgetCategory;
    createdAt: Date;
    updatedAt: Date;
  }

  const ProductSchema: Schema = new Schema(
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      category: {
        type: String,
        enum: ["audio", "accessories", "charging"],
        required: true,
      },
      imageUrl: { type: String },
    },
    { timestamps: true },
  );

  export const Product = mongoose.model<IProduct>("Product", ProductSchema);
