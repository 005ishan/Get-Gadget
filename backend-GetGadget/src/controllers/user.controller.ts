import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { toggleFavouriteDTO } from "../dtos/favourite.dto";
import { addToCartDTO } from "../dtos/cart.dto";
import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger";

const service = new UserService();

export class UserController {
  async toggleFavourite(req: Request, res: Response) {
    const { productId } = toggleFavouriteDTO.parse(req.body);
    const result = await service.toggleFavourite(req.params.userId, productId);
    logger.info("Favourite toggled", { userId: req.params.userId, productId });
    res.json(result);
  }

  async getFavourites(req: Request, res: Response) {
    const result = await service.getFavourites(req.params.userId);
    res.json(result);
  }

  async addToCart(req: Request, res: Response) {
    const { productId, quantity } = addToCartDTO.parse(req.body);
    const result = await service.addToCart(req.params.userId, { productId, quantity });
    res.json(result);
  }

  async updateCartItem(req: Request, res: Response) {
    const { productId, quantity } = req.body;
    const result = await service.updateCartItem(req.params.userId, productId, quantity);
    res.json(result);
  }

  async removeCartItem(req: Request, res: Response) {
    const { productId } = req.body;
    const result = await service.removeCartItem(req.params.userId, productId);
    res.json(result);
  }

  async clearCart(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await UserModel.updateOne({ _id: userId }, { $set: { cart: [] } });
      logger.info("Cart cleared", { userId });
      return res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
      logger.error("Clear cart error:", error);
      return res.status(500).json({ success: false, message: "Failed to clear cart" });
    }
  }

  async getCart(req: Request, res: Response) {
    const result = await service.getCart(req.params.userId);
    res.json(result);
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const { email, password, name, phone, address } = req.body;
      const updateData: any = {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      await UserModel.updateOne({ _id: userId }, { $set: updateData });
      logger.info("Customer profile updated", { userId });
      res.json({ success: true });
    } catch (error) {
      logger.error("Customer update failed", { error });
      res.status(500).json({ message: "Update failed" });
    }
  }
}
