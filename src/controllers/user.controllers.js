import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../cloudinary.js";
import { User } from "../models/user.models.js"

const generateRefreshAndAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const refreshToken = user.generateRefreshTokens();
        const accessToken = user.generateAccessTokens();
        // console.log("o1");
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //take user details
    // check for required fields
    // check if user already exist
    // check for images
    // upload image
    // create a user obj and entry in db
    // remove password and refresh token field from response
    // check for success in creation

    // accepting data
    const { name, email, password, phoneNumber, role, address } = req.body;

    //validation of data
    if ([name, email, password, phoneNumber, address].some((fields) =>
        fields?.trim() === ""
    )) {
        throw new apiError(400, "Please provide all required details");
    }

    const userExist = await User.findOne({
        $or: [{ phoneNumber }, { email }]
    })

    if (userExist) {
        throw new apiError(401, "email or phone number already in use");
    }
    // console.log("Path is: ", req.file.path)
    const profilePicturePath = req.file?.path;

    if (!profilePicturePath) {
        throw new apiError(401, "Profile Path is required.");
    }

    const profilePicture = await uploadOnCloudinary(profilePicturePath);

    console.log("profile image url is: ", profilePicture.url);

    if (!profilePicture) {
        throw new apiError(400, "error while uploading");
    }

    //create entry in DB
    const userEntry = await User.create({
        name: name.toLowerCase(),
        email,
        password,
        role,
        profilePicture: profilePicture.url,
        phoneNumber,
        address
    });

    const createdUser = await User.findById(userEntry._id).select(
        "-password -refreshToken");
    console.log("user created")
    if (!createdUser) {
        throw new apiError(500, "Error while creating error");
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                createdUser,
                "User created successfully"
            )
        )

})

const loginUser = asyncHandler(async (req, res) => {
    //accept the data in res
    // find user
    // check password
    // generate refresf and accesss tokens
    // send them in cookies

    // 
    const { name, email, phoneNumber, password } = req.body;

    if (!(email || phoneNumber)) {
        throw new apiError(400, "email or phone Number is required");
    }
    //finding user
    const user = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    })

    if (!user) {
        throw new apiError(404, "User not found, please register");
    }
    // validating password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid Password");
    }

    //generating refresh and access tokens
    const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(user._id);

    // removing unecessary fields from user
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //this option of cookies make cookies secure and immodifiable from the front end . cookies by default are modifiable 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "Successfully LoggedIn"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true // this new option return the updated document or else it is false
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(
            new apiResponse(
                200,
                {},
                "User Logged Out successfully"
            )
        )
})


export {
    registerUser,
    loginUser,
    logoutUser
};