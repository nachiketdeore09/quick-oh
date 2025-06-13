import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Order } from "../models/order.models.js";
import { Cart } from "../models/cart.models.js";

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    if (!shippingAddress || shippingAddress.trim() === "") {
        throw new apiError(400, "Shipping address is required");
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
        throw new apiError(400, "Your cart is empty");
    }

    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
        const productPrice = item.product.price;
        const discount = item.product.discount || 0;
        const priceAfterDiscount = productPrice - (productPrice * discount / 100);
        totalAmount += priceAfterDiscount * item.quantity;

        return {
            product: item.product._id,
            quantity: item.quantity
        };
    });

    const newOrder = await Order.create({
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentStatus: "Pending", // Assume payment not completed yet
        status: "Pending"
    });

    // Clear cart after placing order
    cart.items = [];
    await cart.save();

    return res
        .status(201)
        .json(
            new apiResponse(
                201,
                newOrder,
                "Order created successfully"
            )
        );
});

//Get All Orders
//Get User's Orders

const getUserOrderHistory = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const orders = await Order.aggregate([
        {
            $match: { user: userId }
        },
        {
            $lookup: {
                from: "products", // your collection name in MongoDB (plural, lowercase)
                localField: "items.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "items.product"
            }
        },
        {
            $unwind: "$items.product"
        },
        {
            $group: {
                _id: "$_id",
                user: { $first: "$user" },
                status: { $first: "$status" },
                totalAmount: { $first: "$totalAmount" },
                createdAt: { $first: "$createdAt" },
                items: { $push: "$items" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                orders,
                "Order history fetched with aggregation"
            )
        );
});

//Get Single Order by ID
const getSingleOrderById = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    console.log(orderId)

    // Validate if orderId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new apiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId)
        .populate("items.product", "productName price discount description productImage") // adjust fields as needed
        .populate("user", "name email"); // optional: if you want user info in admin panel

    if (!order) {
        throw new apiError(404, "Order not found");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                order,
                "Order fetched successfully"
            ));
});
//Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new apiError(400, "Invalid order ID");
    }

    if (!status || !validStatuses.includes(status)) {
        throw new apiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    // Find and update the order
    const order = await Order.findById(orderId);
    if (!order) {
        throw new apiError(404, "Order not found");
    }

    order.status = status;
    await order.save();

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                order,
                "Order status updated successfully"
            )
        );
});
//Cancel Order
const cancelOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new apiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new apiError(404, "Order not found");
    }

    // Check if current user is the order owner or an admin
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new apiError(403, "You are not authorized to cancel this order");
    }

    // Check order status
    if (order.status !== "Pending") {
        throw new apiError(400, `Order cannot be cancelled as it is already ${order.status}`);
    }

    order.status = "Cancelled";
    await order.save();

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                order,
                "Order cancelled successfully"
            )
        );
});


export { createOrder, getUserOrderHistory, getSingleOrderById, updateOrderStatus, cancelOrder };
