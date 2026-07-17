import { Request, Response } from "express";
import { ProductService } from "../../services/admin/product.service";
import { logger } from "../../utils/logger";

export class ProductController {
  private service = new ProductService();

  create = async (req: Request, res: Response) => {
    try {
      const product = await this.service.create(req.body, req.file);
      logger.info("Product created", { name: req.body.name, user: (req as any).user?.email });
      res.status(201).json({ success: true, data: product });
    } catch (err: any) {
      logger.error("Product creation failed", { error: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const products = await this.service.getAll(category);
      res.status(200).json({ success: true, data: products });
    } catch (err: any) {
      logger.error("Failed to get products", { error: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const product = await this.service.getOne(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      res.status(200).json({ success: true, data: product });
    } catch (err: any) {
      logger.error("Failed to get product", { error: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const product = await this.service.update(req.params.id, req.body, req.file);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      logger.info("Product updated", { id: req.params.id, user: (req as any).user?.email });
      res.status(200).json({ success: true, data: product });
    } catch (err: any) {
      logger.error("Product update failed", { error: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete(req.params.id);
      logger.info("Product deleted", { id: req.params.id, user: (req as any).user?.email });
      res.status(200).json({ success: true, message: "Product deleted" });
    } catch (err: any) {
      logger.error("Product deletion failed", { error: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  };

  getByCategory = async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      if (!category) return res.status(400).json({ success: false, message: "Category required" });
      if (!["audio", "accessories", "charging"].includes(category)) {
        return res.status(400).json({ success: false, message: "Invalid category" });
      }
      const products = await this.service.getAll(category);
      res.status(200).json({ success: true, data: products });
    } catch (err: any) {
      logger.error("Failed to get by category", { error: err.message });
      res.status(500).json({ success: false, message: err.message });
    }
  };
}
