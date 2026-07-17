import { Router } from "express";
import { ProductController } from "../../controllers/admin/product.controller";
import { uploads } from "../../middlewares/upload.middleware";
import { Product } from "../../models/product.model";
import rateLimit from "express-rate-limit";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../../middlewares/authorized.middleware";

const router = Router();
const controller = new ProductController();

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many search requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/search", searchLimiter, async (req, res) => {
  try {
    const query = req.query.query?.toString() || "";

    if (!query) {
      return res.status(400).json({ success: false, data: [] });
    }

    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).limit(10);

    res.json({ success: true, data: products });
  } catch (err) {
    console.error("Search route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/category", controller.getByCategory);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.post("/", uploads.single("image"), controller.create);
router.put("/:id", uploads.single("image"), controller.update);
router.delete("/:id", controller.delete);

export default router;
