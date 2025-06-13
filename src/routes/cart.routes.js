import { Router } from "express";
import {
    addProductToCart, getCartInfo, removeAnItemFromCart, clearCart
} from "../controllers/cart.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.middleware.js";

const router = Router();

router.route("/addProductToCart").post(
    verifyJWT,
    addProductToCart
)

router.route("/getCartInfo").get(
    verifyJWT,
    getCartInfo
)

router.route("/removeAnItemFromCart").post(
    verifyJWT,
    removeAnItemFromCart
)

router.route("/clearCart").delete(
    verifyJWT,
    clearCart
)

export default router;