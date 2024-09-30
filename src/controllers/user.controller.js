import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const cookiesOptions = {
    httpOnly: true,
    secure: true
};

const unlinkAvatar = async (avatarLocalPath) => {
    if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
};
const registerUser = asyncHandler(async (req, res) => {
    const {
        fname,
        mname,
        lname,
        email,
        password,
        confirmPassword,
        phone,
    } = req.body;

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log(avatarLocalPath)
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        unlinkAvatar(avatarLocalPath);
        throw new ApiError(400, "User with the provided email already exists");
    }

    const mandatoryFields = {
        fname,
        lname,
        email,
        password,
        confirmPassword,
        phone,
    };

    for (const [key, value] of Object.entries(mandatoryFields)) {
        if (!value || value.trim() === "") {
            unlinkAvatar(avatarLocalPath);
            throw new ApiError(400, `${key} field is mandatory`);
        }
    }

    if (password !== confirmPassword) {
        unlinkAvatar(avatarLocalPath);
        throw new ApiError(400, "Password and confirm password fields do not match");
    }

    // Upload files to Cloudinary
    const avatarRes = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    const userCreate = await User.create({
        fname,
        mname: mname || undefined,
        lname,
        email,
        password,
        phone,
        avatar: {
            secureUrl: avatarRes?.secure_url || undefined,
            publicId: avatarRes?.public_id || undefined
        }
    });

    const userData = await User.findById(userCreate._id).select("-password");

    if (!userData) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    res.status(201).json(
        new ApiResponse(201, "User registration successful", userData)
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const userData = await User.findOne({ email });

    if (!userData) {
        throw new ApiError(404, "User with this credentials doesn't exist");
    }

    const verifyPassword = await userData.isPasswordCorrect(password);

    if (!verifyPassword) {
        throw new ApiError(400, "Password is wrong");
    }

    const UserAccessToken = await userData.generateAccessToken();

    const loggedUser = await User.findById(userData._id).select("-password");

    res
        .status(200)
        .cookie("UserAccessToken", UserAccessToken, cookiesOptions)
        .json(
            new ApiResponse(200, "User login is successful", { loggedUser, UserAccessToken })
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    res
        .status(200)
        .clearCookie("UserAccessToken", cookiesOptions)
        .json(
            new ApiResponse(200, "User is logged out successfully")
        );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const {
        fname,
        mname,
        lname,
        email,
        phone,
        city,
        state,
        country
    } = req.body;

    // Find the user using the authenticated user's ID (assumed to be stored in req.user)
    const user = await User.findById(req?.user?._id);

    // If user not found, throw an error
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Update user details
    user.fname = fname || user.fname; // Update only if a new value is provided
    user.mname = mname || user?.mname;
    user.lname = lname || user.lname;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // Update location fields separately
    user.location.city = city || user?.location?.city;
    user.location.state = state || user?.location?.state;
    user.location.country = country || user?.location?.country;

    // Save the updated user details
    await user.save();
    const updatedUser = await User.findById(user._id).select("-password");
    res
        .status(200)
        .json(
            new ApiResponse(200, "Update details operation is successful", updatedUser)
        );
});


const updateOrUploadAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is missing");
    }

    const oldPublicId = req.user?.avatar?.public_id;

    const isUploaded = await uploadOnCloudinary(avatarLocalPath);

    if (!isUploaded.secure_url || !isUploaded.public_id) {
        throw new ApiError(500, "Some issue occurred while uploading file");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            $set: {
                avatar: {
                    publicId: isUploaded.public_id,
                    secureUrl: isUploaded.secure_url
                }
            }
        },
        {
            new: true
        }
    ).select("-password");

    if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Avatar updated successfully",
                updatedUser
            )
        );
});

const getUserDetails = asyncHandler(async (req, res) => {
    const user = req?.user;
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Details sent successfully",
                user
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    updateUserDetails,
    updateOrUploadAvatar,
    getUserDetails
};
