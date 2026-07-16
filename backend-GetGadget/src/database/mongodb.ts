import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase() {
  // If the configured URI points to a local server, try connecting first.
  // If that fails, fall back to an in-memory MongoDB (no installation needed).
  const isLocal = MONGODB_URI.startsWith("mongodb://localhost") || MONGODB_URI.startsWith("mongodb://127.0.0.1");

  if (isLocal) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 3000, // fail fast if MongoDB isn't reachable
      });
      console.log("Connected to local MongoDB");
      return;
    } catch (err: any) {
      console.log("Local MongoDB not available:", err.message);
      console.log("— starting in-memory MongoDB...");
    }
  }

  // Fallback: use mongodb-memory-server
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`Connected to in-memory MongoDB at ${uri}`);
}
