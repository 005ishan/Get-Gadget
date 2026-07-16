import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

// Security headers
app.use(helmet());
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

// General rate limiter: 100 requests per 15 minutes
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

// CORS config
const corsOptions = {
  origin: FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/users", userRoutess);
app.use("/api/admin/products", productRoutes);
app.use("/api/transactions", transactionRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payment", paymentRoutes);

// Root test routes
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

app.get("/api", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "API root",
    status: "ok",
  });
});

// Global error handler
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
