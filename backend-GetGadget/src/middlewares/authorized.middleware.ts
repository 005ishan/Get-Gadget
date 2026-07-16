import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { BlacklistModel } from "../models/blacklist.model";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
    }
  }
}

let userRepository = new UserRepository();

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      throw new HttpError(401, "Unauthorized JWT invalid");

    const token = authHeader.split(" ")[1];
    if (!token) throw new HttpError(401, "Unauthorized JWT missing");

    // Check if token is blacklisted (revoked on logout)
    const isBlacklisted = await BlacklistModel.findOne({ token: token });
    if (isBlacklisted) {
      throw new HttpError(401, "Token has been revoked");
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
    if (!decodedToken || !decodedToken._id) {
      throw new HttpError(401, "Unauthorized JWT unverified");
    }

    const user = await userRepository.getUserById(decodedToken._id);
    if (!user) throw new HttpError(401, "Unauthorized user not found");

    // Invalidate tokens issued before password was changed
    if (user.passwordChangedAt && decodedToken.iat) {
      const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (changedAt > decodedToken.iat) {
        throw new HttpError(401, "Token expired, please login again");
      }
    }

    req.user = user;
    next();
  } catch (err: Error | any) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized no user info");
    }
    if (req.user.role !== "admin") {
      throw new HttpError(403, "Forbidden not admin");
    }
    return next();
  } catch (err: Error | any) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
