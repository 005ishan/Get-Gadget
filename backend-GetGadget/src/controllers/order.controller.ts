import { Request, Response } from "express";
import mongoose from "mongoose";
import { OrderModel } from "../models/order.model";
import { TransactionModel } from "../models/transaction.model";
import { UserModel } from "../models/user.model";
import { AuditLogModel } from "../models/auditLog.model";
import { logger } from "../utils/logger";

export class OrderController {
  getUserOrders = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const requestingUser = (req as any).user;
      if (requestingUser && requestingUser._id.toString() !== userId) {
        return res.status(403).json({
          message: "Access denied: you can only view your own orders"
        });
      }
      const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      logger.error("Failed to fetch user orders", { error: err });
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  };

  getAllOrders = async (req: Request, res: Response) => {
    try {
      const orders = await OrderModel.find()
        .populate("userId", "email")
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      logger.error("Failed to fetch all orders", { error: err });
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const valid = ["pending", "processing", "shipped", "delivered"];
      if (!valid.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const order = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
      if (!order) return res.status(404).json({ message: "Order not found" });

      await AuditLogModel.create({
        userId: (req as any).user?._id || "admin",
        email: (req as any).user?.email || "admin",
        action: "ORDER_STATUS_UPDATED",
        details: `Order ${id} status changed to ${status}`,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      });

      logger.info("Order status updated", { orderId: id, status });
      res.json(order);
    } catch (err) {
      logger.error("Failed to update order status", { error: err });
      res.status(500).json({ message: "Failed to update status" });
    }
  };

  createOrder = async (req: Request, res: Response) => {
    const { userId, transactionId, items, totalAmount } = req.body;

    if (!userId || !transactionId || !items || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields: userId, transactionId, items, totalAmount" });
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const order = await OrderModel.create([{
        userId, transactionId, items, totalAmount, status: "pending",
      }], { session });

      await UserModel.updateOne(
        { _id: userId },
        { $set: { cart: [] } },
        { session }
      );

      await session.commitTransaction();
      logger.info("Order created with rollback safety", { transactionId, userId });
      return res.status(201).json(order[0]);
    } catch (err) {
      try { await session.abortTransaction(); } catch {}
      logger.error("Order creation with transaction failed, falling back", { error: err });
      try {
        const order = await OrderModel.create({
          userId, transactionId, items, totalAmount, status: "pending",
        });
        await UserModel.updateOne({ _id: userId }, { $set: { cart: [] } });
        logger.info("Order created without transaction", { transactionId, userId });
        return res.status(201).json(order);
      } catch (fallbackErr) {
        logger.error("Order creation failed completely", { error: fallbackErr });
        return res.status(500).json({ message: "Failed to create order" });
      }
    } finally {
      session.endSession();
    }
  };

  backfillOrders = async (req: Request, res: Response) => {
    try {
      const { transactions } = req.body;
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ message: "No transactions provided" });
      }
      const existingOrders = await OrderModel.find({}).select("transactionId");
      const existingTxIds = new Set(existingOrders.map((o) => o.transactionId));
      let created = 0;
      let skipped = 0;

      for (const tx of transactions) {
        if (!tx.userId || !tx.transactionId || !tx.items || !tx.totalAmount) {
          skipped++;
          continue;
        }
        if (existingTxIds.has(tx.transactionId)) {
          skipped++;
          continue;
        }
        await OrderModel.create({
          userId: tx.userId,
          transactionId: tx.transactionId,
          items: tx.items,
          totalAmount: tx.totalAmount,
          status: "pending",
        });
        created++;
      }
      logger.info("Orders backfilled", { created, skipped });
      res.json({
        success: true,
        message: `Created ${created} order(s), skipped ${skipped} transaction(s)`,
        created, skipped,
      });
    } catch (err) {
      logger.error("Failed to backfill orders", { error: err });
      res.status(500).json({ message: "Failed to backfill orders" });
    }
  };
}
