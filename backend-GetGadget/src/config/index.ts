import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 5050;
export const MONGODB_URI: string =
  process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith("mongodb+srv://")
    ? process.env.MONGODB_URI
    : "mongodb://localhost:27017/getgadget";

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}
export const JWT_SECRET: string = rawSecret;

export const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";
