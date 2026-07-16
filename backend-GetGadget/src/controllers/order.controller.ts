import { Request, Response } from "express";
import { OrderModel } from "../models/order.model";

export class OrderController {
  // GET /api/orders — customer gets their own orders
  getUserOrders = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  };

  // GET /api/admin/orders — admin gets ALL orders
  getAllOrders = async (req: Request, res: Response) => {
    try {
      const orders = await OrderModel.find()
        .populate("userId", "email")
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  };

  // PATCH /api/admin/orders/:id/status — admin updates status
  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const valid = ["pending", "processing", "shipped", "delivered"];
      if (!valid.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await OrderModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );

      if (!order) return res.status(404).json({ message: "Order not found" });

      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to update status" });
    }
  };

  // POST /api/orders — create order after successful payment
  createOrder = async (req: Request, res: Response) => {
    try {
      const { userId, transactionId, items, totalAmount } = req.body;
      const order = await OrderModel.create({
        userId,
        transactionId,
        items,
        totalAmount,
        status: "pending",
      });
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to create order" });
    }
  };

  // POST /api/admin/orders/backfill — create orders from existing transactions
  backfillOrders = async (req: Request, res: Response) => {
    try {
      const { transactions } = req.body;
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ message: "No transactions provided" });
      }

      // Get existing order transactionIds to avoid duplicates
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

      res.json({
        success: true,
        message: `Created ${created} order(s), skipped ${skipped} transaction(s)`,
        created,
        skipped,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to backfill orders" });
    }
  };
}
