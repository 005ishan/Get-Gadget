import { Request, Response, NextFunction } from "express";
import axios from "axios";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "";

export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  const captchaToken = req.body.captchaToken;

  if (process.env.NODE_ENV === "test" || !RECAPTCHA_SECRET_KEY || !captchaToken) {
    return next();
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      }
    );

    const { success, score } = response.data;

    if (!success || (score !== undefined && score < 0.5)) {
      return res.status(400).json({ success: false, message: "CAPTCHA verification failed" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "CAPTCHA verification error" });
  }
};
