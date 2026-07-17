import { z } from "zod";

export const favouriteItemSchema = z.object({
  product: z.string(),
  addedAt: z.date().default(() => new Date()),
});

export const cartItemSchema = z.object({
  product: z.string(),
  quantity: z.number().min(1),
  addedAt: z.date().default(() => new Date()),
});

export type CartItemType = z.infer<typeof cartItemSchema>;
export type FavouriteItemType = z.infer<typeof favouriteItemSchema>;

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]).default("user"),
  passwordChangedAt: z.date().optional(),
  name: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  loginAttempts: z.number().optional().default(0),
  lockUntil: z.date().optional().nullable().default(null),
  otpCode: z.string().optional().nullable().default(null),
  otpExpires: z.date().optional().nullable().default(null),
  otpVerified: z.boolean().optional().default(false),
  favourites: z.array(favouriteItemSchema).default([]),
  cart: z.array(cartItemSchema).default([]),
});

export type userType = z.infer<typeof userSchema>;
