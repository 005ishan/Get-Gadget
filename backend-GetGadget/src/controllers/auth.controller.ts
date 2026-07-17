import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { createUserDTO, loginUserDTO, updateUserDTO } from "../dtos/user.dto";
import z from "zod";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.service";
import { BlacklistModel } from "../models/blacklist.model";
import { AuditLogModel } from "../models/auditLog.model";
import { logger } from "../utils/logger";

const authService = new AuthService();
const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsed = createUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }
      const user = await authService.createUser(parsed.data);
      logger.info("User registered", { email: parsed.data.email });
      return res.status(201).json({
        success: true,
        message: "Registered successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsed = loginUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const result = await authService.loginUser(parsed.data, req);

      // If MFA is required, return early
      if ((result as any).mfaRequired) {
        return res.status(200).json({
          success: true,
          mfaRequired: true,
          userId: (result as any).userId,
          message: (result as any).message,
        });
      }

      const { token, user } = result as any;
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Invalid email or password",
      });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { userId, otp } = req.body;
      if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "userId and otp required" });
      }
      const result = await authService.verifyMfaOtp(userId, otp, req);
      return res.status(200).json({
        success: true,
        message: "OTP verified",
        token: result.token,
        data: result.user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "OTP verification failed",
      });
    }
  }

  async enableMfa(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
      const result = await authService.enableMfa(userId);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async disableMfa(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
      const result = await authService.disableMfa(userId);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      let token: string | null = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (token) {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.exp) {
          await BlacklistModel.create({
            token: token,
            expiresAt: new Date(decoded.exp * 1000),
          });
        }
      }

      if ((req as any).user?.email) {
        await AuditLogModel.create({
          userId: (req as any).user._id,
          email: (req as any).user.email,
          action: "LOGOUT",
          details: "User logged out",
          ip: req.ip || "unknown",
          userAgent: req.headers["user-agent"] || "unknown",
        });
      }

      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      logger.info("User logged out", { email: (req as any).user?.email });
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
      const user = await authService.getUserById(userId);
      return res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      const user = await userService.sendResetPasswordEmail(email);
      return res.status(200).json({
        success: true,
        data: user,
        message: "Password reset email sent",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.params.token;
      const { newPassword } = req.body;
      await userService.resetPassword(token, newPassword);
      return res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Failed to reset password",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
      const parsed = updateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
      }
      const updateData = parsed.data;
      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }
      const updatedUser = await authService.updateUser(userId, updateData);
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async exportData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
      const data = await authService.exportUserData(userId);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=getgadget-my-data.json");
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async importData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
      const user = await authService.importUserData(userId, req.body);
      return res.status(200).json({ success: true, message: "Data imported successfully", data: user });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message });
    }
  }
}
