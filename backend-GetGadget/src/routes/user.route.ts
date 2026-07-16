import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const controller = new UserController();

router.post("/:userId/favourite", authorizedMiddleware, controller.toggleFavourite);
router.get("/:userId/favourite", authorizedMiddleware, controller.getFavourites);

router.post("/:userId/cart", authorizedMiddleware, controller.addToCart);
router.put("/:userId/cart", authorizedMiddleware, controller.updateCartItem);
router.delete("/:userId/cart", authorizedMiddleware, controller.removeCartItem);
router.get("/:userId/cart", authorizedMiddleware, controller.getCart);
router.delete("/:userId/cart/clear", authorizedMiddleware, controller.clearCart);

router.put("/:id", authorizedMiddleware, controller.updateCustomer);

export default router;
