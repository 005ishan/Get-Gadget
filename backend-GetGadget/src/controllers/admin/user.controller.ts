import { createUserDTO, loginUserDTO, updateUserDTO } from "../../dtos/user.dto";
import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/user.service";
import { QueryParams } from "../../types/query.type";
import { AuditLogModel } from "../../models/auditLog.model";
import { logger } from "../../utils/logger";

let adminUserService = new AdminUserService();

export class AdminUserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = createUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }
      const newUser = await adminUserService.createUser(parsedData.data);
      await AuditLogModel.create({
        userId: (req as any).user?._id || "admin",
        email: (req as any).user?.email || "admin",
        action: "ADMIN_CREATE_USER",
        details: `Admin created user: ${parsedData.data.email}`,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      });
      logger.info("Admin created user", { email: parsedData.data.email });
      return res.status(201).json({ success: true, message: "User Created", data: newUser });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false, message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, size, search }: QueryParams = req.query;
      const { users, pagination } = await adminUserService.getAllUsers(page, size, search);
      return res.status(200).json({ success: true, data: users, pagination, message: "All Users Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false, message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const parsedData = updateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      if (req.file) parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await adminUserService.updateUser(userId, parsedData.data);
      await AuditLogModel.create({
        userId: (req as any).user?._id || "admin",
        email: (req as any).user?.email || "admin",
        action: "ADMIN_UPDATE_USER",
        details: `Admin updated user: ${userId}`,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      });
      logger.info("Admin updated user", { userId });
      return res.status(200).json({ success: true, message: "User Updated", data: updatedUser });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false, message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const deleted = await adminUserService.deleteUser(userId);
      if (!deleted) return res.status(404).json({ success: false, message: "User not found" });
      await AuditLogModel.create({
        userId: (req as any).user?._id || "admin",
        email: (req as any).user?.email || "admin",
        action: "ADMIN_DELETE_USER",
        details: `Admin deleted user: ${userId}`,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      });
      logger.info("Admin deleted user", { userId });
      return res.status(200).json({ success: true, message: "User Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false, message: error.message || "Internal Server Error",
      });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("authToken", {
        httpOnly: true, secure: true, sameSite: "lax", path: "/",
      });
      return res.status(200).json({ success: true, message: "Admin logged out successfully" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false, message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const user = await adminUserService.getUserById(userId);
      return res.status(200).json({ success: true, data: user, message: "Single User Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false, message: error.message || "Internal Server Error",
      });
    }
  }
}
