import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { createUserDTO, loginUserDTO } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import { JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";
import { AuditLogModel } from "../models/auditLog.model";
import { logger } from "../utils/logger";

const userRepository = new UserRepository();

function getClientIp(req?: any): string {
  return req?.ip || req?.headers?.["x-forwarded-for"] || "unknown";
}

function getUserAgent(req?: any): string {
  return req?.headers?.["user-agent"] || "unknown";
}

export class AuthService {
  async createUser(data: createUserDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new HttpError(409, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser({
      ...data,
      passwordChangedAt: new Date(),
    });

    const { password, ...safeUser } = newUser.toObject
      ? newUser.toObject()
      : newUser;

    logger.info("User registered", { email: data.email });
    return safeUser;
  }

  async loginUser(data: loginUserDTO, req?: any) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const remaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
      throw new HttpError(423, `Account locked. Try again in ${remaining} minutes`);
    }

    const isPasswordValid = await bcryptjs.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      // Increment login attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const update: any = { loginAttempts: attempts };
      if (attempts >= 5) {
        update.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        update.loginAttempts = 0;
        logger.warn("Account locked due to failed attempts", { email: data.email });
      }
      await userRepository.updateUser(user._id.toString(), update);
      throw new HttpError(401, `Invalid credentials (${attempts}/5 attempts)`);
    }

    if (user.loginAttempts > 0 || user.lockUntil) {
      await userRepository.updateUser(user._id.toString(), {
        loginAttempts: 0,
        lockUntil: null as any,
      });
    }

    if (user.otpVerified) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await userRepository.updateUser(user._id.toString(), {
        otpCode: otp,
        otpExpires: otpExpires,
      });

      await sendEmail(
        user.email,
        "Your MFA Code - GetGadget",
        `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
      );

      await AuditLogModel.create({
        userId: user._id.toString(),
        email: user.email,
        action: "MFA_OTP_SENT",
        details: "MFA code sent for login",
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
      });

      return {
        mfaRequired: true,
        userId: user._id.toString(),
        message: "MFA code sent to your email",
      };
    }

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15d",
    });

    const { password, ...safeUser } = user.toObject ? user.toObject() : user;

    await AuditLogModel.create({
      userId: user._id.toString(),
      email: user.email,
      action: "LOGIN",
      details: "User logged in successfully",
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    logger.info("User logged in", { email: data.email });
    return { token, user: safeUser };
  }

  async verifyMfaOtp(userId: string, otp: string, req?: any) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    if (!user.otpCode || !user.otpExpires) {
      throw new HttpError(400, "No OTP requested");
    }

    if (user.otpExpires < new Date()) {
      throw new HttpError(400, "OTP expired, please login again");
    }

    if (user.otpCode !== otp) {
      throw new HttpError(401, "Invalid OTP code");
    }

    // Clear OTP fields
    await userRepository.updateUser(userId, {
      otpCode: null as any,
      otpExpires: null as any,
    });

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15d",
    });

    const { password, ...safeUser } = user.toObject ? user.toObject() : user;

    await AuditLogModel.create({
      userId: user._id.toString(),
      email: user.email,
      action: "MFA_VERIFIED",
      details: "MFA OTP verified successfully",
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return { token, user: safeUser };
  }

  async enableMfa(userId: string) {
    await userRepository.updateUser(userId, { otpVerified: true } as any);
    logger.info("MFA enabled for user", { userId });
    return { message: "MFA enabled successfully" };
  }

  async disableMfa(userId: string) {
    await userRepository.updateUser(userId, {
      otpVerified: false,
      otpCode: null as any,
      otpExpires: null as any,
    } as any);
    logger.info("MFA disabled for user", { userId });
    return { message: "MFA disabled successfully" };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");
    const { password, ...safeUser } = user.toObject ? user.toObject() : user;
    return safeUser;
  }

  async updateUser(userId: string, data: Partial<any>) {
    if (data.password) {
      const user = await userRepository.getUserById(userId);
      if (user) {
        const isSameAsOld = await bcryptjs.compare(data.password, user.password);
        if (isSameAsOld) {
          throw new HttpError(400, "Cannot reuse your current password");
        }
      }
      data.password = await bcryptjs.hash(data.password, 10);
      data.passwordChangedAt = new Date();
    }

    const updatedUser = await userRepository.updateUser(userId, data);
    if (!updatedUser) throw new HttpError(404, "User not found");

    const { password, ...safeUser } = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    return safeUser;
  }

  async exportUserData(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");
    const { password, otpCode, otpExpires, ...safeData } = user.toObject
      ? user.toObject()
      : user;
    return safeData;
  }

  async importUserData(userId: string, data: any) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const allowedFields: Record<string, any> = {};
    if (data.name) allowedFields.name = data.name;
    if (data.phone) allowedFields.phone = data.phone;
    if (data.address) allowedFields.address = data.address;
    if (data.email) allowedFields.email = data.email;

    if (Object.keys(allowedFields).length === 0) {
      throw new HttpError(400, "No importable fields found");
    }

    const updatedUser = await userRepository.updateUser(userId, allowedFields);
    if (!updatedUser) throw new HttpError(500, "Failed to import data");

    const { password, ...safeUser } = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    logger.info("User data imported", { userId, fields: Object.keys(allowedFields) });
    return safeUser;
  }
}
