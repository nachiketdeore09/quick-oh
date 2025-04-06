import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../cloudinary.js";
import { Product } from "../models/product.models.js";

const createProduct = asyncHandler(async (req, res) => {
    //take product details
    //validate the details
    // check if product already exist
    // check for images 
    // upload images
    // create a entry in db
    // return product

    const { productName, description, productCategory, price, discount, stock, vendor } = req.body;

    if ([productName, description, productCategory, price, stock, vendor].some((feild) =>
        feild?.trim() === ""
    )) {
        throw new apiError(400, "All feilds are required");
    }

    const productExist = await Product.findOne({
        $and: [{ productName }, { vendor }]
    })

    if (productExist) {
        throw new apiError(400, "Product already exists for this vendor");
    }

    const productImagePath = req.file?.path;

    if (!productImagePath) {
        throw new apiError(401, "please upload product image");
    }

    const productImage = await uploadOnCloudinary(productImagePath);

    if (!productImage) {
        throw new apiError(400, "error while uploading");
    }

    const productEntry = await Product.create(
        {
            productName,
            description,
            productCategory,
            price,
            discount: discount || 0, // Default discount to 0 if not provided
            stock,
            vendor,
            productImage: productImage.url,
        }
    )

    if (!productEntry) {
        throw new apiError(401, "Error while creating product");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                productEntry,
                "Product created successfully"
            )
        )

})

export {
    createProduct,
}