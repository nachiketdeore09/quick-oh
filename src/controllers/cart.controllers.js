import { asyncHandler } from "../utils/asyncHandler.js";
import { Cart } from "../models/cart.models.js";
import { Product } from "../models/product.models.js";
import { User } from "../models/user.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

const addProductToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        throw new apiError(404, "Product not found");
    }

    let cart = await Cart.findOne(
        { user: userId }
    );

    if (!cart) {
        cart = await Cart.create(
            { user: userId, items: [] }
        );
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += parseInt(quantity || 1, 10);
    } else {
        cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    return res.status(200).json(new apiResponse(200, cart, "Item added to cart"));
});

const getCartInfo = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
        throw new apiError(404, "Cart not found");
    }

    let total = 0;
    cart.items.forEach(item => {
        const price = item.product.discount > 0
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;

        total += price * item.quantity;
    });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { cart, total },
                "Cart fetched"
            ));
});

const removeAnItemFromCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const productId = req.body.productId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new apiError(404, "Cart not found");

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                cart,
                "Item removed"
            ));
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                null,
                "Cart cleared"
            ));
});

export {
    addProductToCart,
    getCartInfo,
    removeAnItemFromCart,
    clearCart
}
