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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { userId, productName, amount, paymentMethod } = req.body;
      const transactionId = Date.now().toString();

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
      await session.abortTransaction();
      logger.error("Payment failed, rolled back", { error });
      return res.status(500).json({ message: "Payment failed" });
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