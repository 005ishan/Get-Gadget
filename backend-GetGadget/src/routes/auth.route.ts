import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { verifyCaptcha } from "../middlewares/captcha.middleware";

let authController = new AuthController();
const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 100 : 10,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, verifyCaptcha, authController.register);
router.post("/login", authLimiter, verifyCaptcha, authController.login);
router.post("/verify-otp", authLimiter, authController.verifyOtp);
router.post("/logout", authorizedMiddleware, authController.logout);
router.get("/profile", authorizedMiddleware, authController.getProfile);
router.put("/profile", authorizedMiddleware, authController.updateProfile);
router.post("/mfa/enable", authorizedMiddleware, authController.enableMfa);
router.post("/mfa/disable", authorizedMiddleware, authController.disableMfa);
router.get("/export-data", authorizedMiddleware, authController.exportData);
router.post("/import-data", authorizedMiddleware, authController.importData);

router.post("/request-password-reset", authLimiter, authController.requestPasswordReset);
router.post("/reset-password/:token", authLimiter, authController.resetPassword);

export default router;
