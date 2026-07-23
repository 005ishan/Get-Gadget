import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger";
import { FRONTEND_URL } from "./config";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/admin/user.route";
import userRoutess from "./routes/user.route";
import path from "path";
import { HttpError } from "./errors/http-error";
import productRoutes from "./routes/admin/product.route";
import transactionRouter from "./routes/transaction.route";
import orderRoutes from "./routes/order.route";
import adminOrderRoutes from "./routes/admin/order.route";
import paymentRoutes from "./routes/payment.route";

const app: Application = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(helmet.hidePoweredBy());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

app.use((req, res, next) => {
  const timeout = req.path.startsWith("/api/admin/products") ? 60000 : 30000;
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({ success: false, message: "Request timeout" });
    }
  });
  next();
});

const corsOptions = {
  origin: FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/users", userRoutess);
app.use("/api/admin/products", productRoutes);
app.use("/api/transactions", transactionRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const mongoose = await import("mongoose");
    const dbState = mongoose.default.connection.readyState;
    const states: Record<number, string> = {
      0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting",
    };
    res.json({
      success: true,
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: states[dbState] || "unknown",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (err) {
    res.status(500).json({ success: false, status: "error", message: "Health check failed" });
  }
});

app.get("/api", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "API root",
    status: "ok",
  });
});

// 404 catch-all — prevents info leakage on unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
});

export default app;
