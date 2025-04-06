import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

export const checkVendor = asyncHandler(async (req, res, next) => {
    try {

    } catch (error) {
        throw new apiError(404, "error while verifying vendor")
    }
})