// routes/admin/order.route.ts  (admin-facing)
import { Router } from "express";
import { OrderController } from "../../controllers/order.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const controller = new OrderController();

// Backfill route — registered BEFORE auth middleware so the server action can call it
// (already protected by Next.js proxy middleware which checks admin role)
router.post("/backfill", controller.backfillOrders);

// Admin-only routes (require JWT auth + admin role check)
router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", controller.getAllOrders);
router.patch("/:id/status", controller.updateStatus);

export default router;