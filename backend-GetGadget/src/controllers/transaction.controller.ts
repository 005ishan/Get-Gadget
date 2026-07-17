import { Request, Response } from "express";
import mongoose from "mongoose";
import { TransactionModel } from "../models/transaction.model";
import { UserModel } from "../models/user.model";
import { logger } from "../utils/logger";

export class TransactionController {
  async getUserTransactions(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const transactions = await TransactionModel.find({
        userId,
      }).sort({ createdAt: -1 });
      
      res.json(transactions);
    } catch (error) {
      logger.error("Failed to fetch transactions", { error });
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  }

  async paymentSuccess(req: Request, res: Response) {
    const { userId, productName, amount, paymentMethod } = req.body;
    if (!userId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields: userId, amount, paymentMethod" });
    }

    const transactionId = Date.now().toString();
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const [transaction] = await TransactionModel.create([{
        userId, productName, amount, paymentMethod, transactionId,
      }], { session });

      await UserModel.updateOne(
        { _id: userId },
        { $set: { cart: [] } },
        { session }
      );

      await session.commitTransaction();
      logger.info("Payment processed with rollback safety", { transactionId, userId, amount });
      return res.json({ success: true, transaction });
    } catch (error) {
      try { await session.abortTransaction(); } catch {}
      logger.error("Payment transaction failed, falling back without transaction", { error });
      try {
        const transaction = await TransactionModel.create({
          userId, productName, amount, paymentMethod, transactionId,
        });
        logger.info("Transaction created without transaction (fallback)", { transactionId });
        return res.json({ success: true, transaction });
      } catch (fallbackErr) {
        logger.error("Payment failed completely", { error: fallbackErr });
        return res.status(500).json({ message: "Payment failed" });
      }
    } finally {
      session.endSession();
    }
  }

  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await TransactionModel.find();

      return res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      logger.error("Failed to fetch all transactions", { error });
      res.status(500).json({ success: false, message: "Failed to fetch transactions" });
    }
  }
}