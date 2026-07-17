import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";

process.env.NODE_ENV = "test";

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

