import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { JWT_SECRET } from "../../config";

const TAG = "authtest_";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await new Promise<void>((resolve) =>
      mongoose.connection.once("connected", resolve)
    );
  }
  await UserModel.deleteMany({ email: new RegExp(TAG) });
  await UserModel.create({
    email: `${TAG}user@test.com`,
    password: await bcrypt.hash("Password1!", 10),
    role: "user",
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await UserModel.deleteMany({ email: new RegExp(TAG) });
  }
});

describe("POST /api/auth/register", () => {
  it("TC-AUTH-01: registers a new user and returns 201 without exposing password", async () => {
    const email = `${TAG}reg01@test.com`;
    const res = await request(app).post("/api/auth/register").send({
      email,
      password: "Password1!",
      confirmPassword: "Password1!",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toHaveProperty("password");
    await UserModel.deleteOne({ email }); // self-clean
  });

  it("TC-AUTH-02: returns 400 when passwords do not match", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: `${TAG}reg02@test.com`,
      password: "Password1!",
      confirmPassword: "Different1!",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("TC-AUTH-03: returns 409 when email is already registered", async () => {
    const email = `${TAG}reg03@test.com`;
    await UserModel.create({ email, password: "hashed", role: "user" });
    const res = await request(app).post("/api/auth/register").send({
      email,
      password: "Password1!",
      confirmPassword: "Password1!",
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    await UserModel.deleteOne({ email }); // self-clean
  });

  it("TC-AUTH-04: returns 400 when email field is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      password: "Password1!",
      confirmPassword: "Password1!",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("TC-AUTH-05: returns 400 when password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: `${TAG}reg05@test.com`,
      password: "abc",
      confirmPassword: "abc",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("TC-AUTH-06: returns 400 when email format is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "Password1!",
      confirmPassword: "Password1!",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  it("TC-AUTH-07: returns 200 with JWT token on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: `${TAG}user@test.com`,
      password: "Password1!",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("TC-AUTH-08: returns 401 when password is incorrect", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: `${TAG}user@test.com`,
      password: "WrongPass99!",
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("TC-AUTH-09: returns 404 when user email does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: `${TAG}ghost@test.com`,
      password: "Password1!",
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("TC-AUTH-10: returns 400 when email format is invalid on login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-valid",
      password: "Password1!",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/logout & password reset", () => {
  let authToken: string;

  beforeAll(async () => {
    const user = await UserModel.findOne({ email: `${TAG}user@test.com` });
    if (!user) throw new Error("Seed user not found");
    authToken = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
  });

  it("TC-AUTH-11: returns 200 and success message on logout", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Logout successful");
  });

  it("TC-AUTH-12: returns 400 when requesting password reset with missing email", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email is required");
  });
});