import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 5050;
export const MONGODB_URI: string =
  process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith("mongodb+srv://")
    ? process.env.MONGODB_URI
    : "mongodb://localhost:27017/getgadget";

export const JWT_SECRET: string = process.env.JWT_SECRET || "default";

// Fail fast in production if JWT_SECRET is still default
if (JWT_SECRET === "default" && process.env.NODE_ENV === "production") {
  console.error("FATAL: JWT_SECRET must be set in production!");
  process.exit(1);
}

export const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";
