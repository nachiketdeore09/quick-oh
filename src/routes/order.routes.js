import { Router } from "express";
import {
    createOrder, getUserOrderHistory, getSingleOrderById, updateOrderStatus, cancelOrder
} from "../controllers/order.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.middleware.js";

const router = Router();

router.route("/createOrder").post(
    verifyJWT,
    createOrder
)

router.route("/getUserOrderHistory").get(
    verifyJWT,
    getUserOrderHistory
)

router.route("/getSingleOrderById/:id").get(
    verifyJWT,
    getSingleOrderById
)

router.route("/updateOrderStatus/:id").post(
    verifyJWT,
    checkAdmin,
    updateOrderStatus
)

router.route("/cancelOrder/:id").put(
    verifyJWT,
    cancelOrder
)


export default router;