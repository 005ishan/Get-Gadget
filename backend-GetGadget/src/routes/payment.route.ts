import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

const router = Router();

console.log("[Khalti] KHALTI_SECRET_KEY loaded:", process.env.KHALTI_SECRET_KEY ? "YES (set)" : "NO (using fallback)");

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 100 : 20,
  message: {
    success: false,
    message: "Too many payment attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(paymentLimiter);

router.post("/esewa/signature", (req: Request, res: Response) => {
  try {
    const { total_amount, transaction_uuid, product_code } = req.body;

    const secretKey = "8gBm/:&EnhH.1/q";
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    res.json({ signature });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate signature" });
  }
});

router.post("/khalti/initiate", async (req: Request, res: Response) => {
  try {
    const { amount, productName, orderId, customerName, customerEmail } =
      req.body;

    const KHALTI_SECRET_KEY =
      process.env.KHALTI_SECRET_KEY || "your_test_key_here";

    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: `${process.env.FRONTEND_URL}/auth/payment-success`,
        website_url: process.env.FRONTEND_URL || "http://localhost:3000",
        amount: amount * 100,
        purchase_order_id: orderId,
        purchase_order_name: productName,
        customer_info: {
          name: customerName || "Customer",
          email: customerEmail || "customer@example.com",
          phone: "9800000000",
        },
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json(response.data);
  } catch (err: any) {
    console.error("Khalti initiate error:", err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to initiate Khalti payment" });
  }
});

router.post("/khalti/verify", async (req: Request, res: Response) => {
  try {
    const { pidx } = req.body;
    const KHALTI_SECRET_KEY =
      process.env.KHALTI_SECRET_KEY || "your_test_key_here";

    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json(response.data);
  } catch (err: any) {
    console.error("Khalti verify error:", err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to verify Khalti payment" });
  }
});

export default router;
