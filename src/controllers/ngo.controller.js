import { asyncHandler } from "../utils/asyncHandler.js";
import { NGO } from "../models/ngo.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import mongoose from "mongoose";
import { log } from "console";


const cookiesOptions = {
    httpOnly: true,
    secure: true
}

const unlinkAvatar = async (avatarLocalPath) => {
    if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
}

const unlinkCoverImage = async (coverImageLocalPath) => {
    if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath);
}

const registerNGO = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        email,
        phone,
        registrationNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        website,
        password,
        confirmPassword,
        facebook,
        twitter,
        linkedin,
        instagram,
    } = req.body;

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // Check if NGO already exists
    const ngoExists = await NGO.findOne({
        $or: [
            { email },
            { registrationNumber },
        ]
    });

    if (ngoExists) {
        unlinkAvatar(avatarLocalPath);
        unlinkCoverImage(coverImageLocalPath);
        throw new ApiError(400, "NGO with the provided email or registration number already exists");
    }

    const mandatoryFields = {
        name,
        description,
        email,
        phone,
        registrationNumber,
        addressLine1,
        city,
        state,
        country,
        postalCode,
        password,
        confirmPassword,
        website
    };

    for (const [key, value] of Object.entries(mandatoryFields)) {
        if (!value || value.trim() === "") {
            unlinkAvatar(avatarLocalPath);
            unlinkCoverImage(coverImageLocalPath);
            throw new ApiError(400, `${key} field is mandatory`);
        }
    }

    if (password !== confirmPassword) {
        unlinkAvatar(avatarLocalPath);
        unlinkCoverImage(coverImageLocalPath);
        throw new ApiError(400, "Password and confirm password fields do not match");
    }

    // Upload files to Cloudinary
    const avatarRes = coverImageLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    const coverImageRes = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    const ngoCreate = await NGO.create({
        name,
        description,
        contact: {
            phone,
            email,
            social_media: {
                facebook: facebook || undefined,
                twitter: twitter || undefined,
                linkedin: linkedin || undefined,
                instagram: instagram || undefined,
            },
        },
        address: {
            addressLine1,
            addressLine2: addressLine2 || undefined,
            city,
            state,
            country,
            postalCode,
        },
        website,
        registrationNumber,
        avatar: {
            secure_url: avatarRes?.secure_url || undefined,
            public_id: avatarRes?.public_id || undefined
        },
        coverImage: {
            secure_url: coverImageRes?.secure_url || undefined,
            public_id: coverImageRes?.public_id || undefined
        },
        password
    });

    const ngoData = await NGO.findById(ngoCreate._id).select("-password");

    if (!ngoData) {
        throw new ApiError(500, "Something went wrong while registering NGO");
    }

    res.status(201).json(
        new ApiResponse(201, "NGO registration successful", ngoData)
    );
})


const loginNGO = asyncHandler(async (req, res) => {

    const { registrationNumber, email, password } = req.body;

    if (!registrationNumber && !email)  // (!(registrationNumber || email)) will also give same output
        throw new ApiError(400, "registrationNumber or email is required");

    if (!password)
        throw new ApiError(400, "Password is required")

    const ngoData = await NGO.findOne({
        $or: [
            { registrationNumber },
            { email }
        ]
    });

    if (!ngoData)
        throw new ApiError(404, "NGO with this credentials doesn't exist");

    const verifyPassword = await ngoData.isPasswordCorrect(password);

    if (!verifyPassword)
        throw new ApiError(400, "Password is wrong");

    const accessToken = await ngoData.generateAccessToken();

    const loggedNGO = await NGO.findById(ngoData._id).select(
        "-password"
    );

    res
        .status(200)
        .cookie("accessToken", accessToken, cookiesOptions)
        .json(
            new ApiResponse(
                200,
                "NGO login is successful",
                { loggedNGO, accessToken }
            ))

})

const logoutNGO = asyncHandler(async (req, res) => {

    res
        .status(200)
        .clearCookie("accessToken", cookiesOptions)
        .json(
            new ApiResponse(
                200,
                "NGO is logged out successfully")
        );


})
const updateNGODetails = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        website,
        facebook,
        twitter,
        linkedin,
        instagram,
    } = req.body;

    // Find the NGO using the authenticated user's ID (assumed to be stored in req.user)
    const ngo = await NGO.findById(req?.ngo?._id);

    // If NGO not found, throw an error
    if (!ngo) {
        throw new ApiError(404, "NGO not found");
    }
    // Update NGO details
    ngo.name = name || ngo.name; // Update only if a new value is provided
    ngo.description = description || ngo.description;
    ngo.contact.email = email || ngo.contact.email;
    ngo.contact.phone = phone || ngo.contact.phone;
    ngo.address.addressLine1 = addressLine1 || ngo.address.addressLine1;
    ngo.address.addressLine2 = addressLine2 || ngo.address.addressLine2;
    ngo.address.city = city || ngo.address.city;
    ngo.address.state = state || ngo.address.state;
    ngo.address.country = country || ngo.address.country;
    ngo.address.postalCode = postalCode || ngo.address.postalCode;
    ngo.website = website || ngo.website;
    ngo.contact.social_media.facebook = facebook || ngo.contact.social_media.facebook;
    ngo.contact.social_media.twitter = twitter || ngo.contact.social_media.twitter;
    ngo.contact.social_media.linkedin = linkedin || ngo.contact.social_media.linkedin;
    ngo.contact.social_media.instagram = instagram || ngo.contact.social_media.instagram;

    // Save the updated NGO details
    await ngo.save();
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Update details operation is successful"
            ))
});

const updateOrUploadCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is missing");
    }

    const oldPublic_id = req.ngo?.coverImage?.public_id;

    const isUploaded = await uploadOnCloudinary(coverImageLocalPath);

    if (!isUploaded.secure_url || !isUploaded.public_id) {
        throw new ApiError(500, "Some issue occured while uploading file")
    }
    const updatedUser = await NGO.findByIdAndUpdate(
        req.ngo.id,
        {
            $set:
            {
                coverImage: {
                    public_id: isUploaded.public_id,
                    secure_url: isUploaded.secure_url
                }
            }
        },
        {
            new: true
        }
    ).select(
        "-password"
    )

    if (oldPublic_id) {
        await deleteFromCloudinary(oldPublic_id)
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "CoverImages added successfully",
                {
                    updatedUser
                }
            )
        )
})

const updateOrUploadAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is missing");
    }

    // const user = await User.findById(req.user._id);
    const oldPublicId = req.ngo?.avatar?.public_id

    const isUploaded = await uploadOnCloudinary(avatarLocalPath);

    if (!isUploaded.secure_url || !isUploaded.public_id) {
        throw new ApiError(500, "Some issue occured while uploading file")
    }
    const updatedUser = await NGO.findByIdAndUpdate(
        req.ngo.id,
        {
            $set:
            {
                avatar: {
                    public_id: isUploaded.public_id,
                    secure_url: isUploaded.secure_url
                }
            }
        },
        {
            new: true
        }
    ).select(
        "-password"
    )
    if(oldPublicId){
        await deleteFromCloudinary(oldPublicId)
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Avatar updated successfully",
                updatedUser
            )
        )
})

const getDetails = asyncHandler(async(req, res)=>{
    const ngo = req?.ngo;
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Details sent successfully",
                ngo
            )
        )
})

export {
    registerNGO,
    loginNGO,
    logoutNGO,
    updateNGODetails,
    updateOrUploadCoverImage,
    updateOrUploadAvatar,
    getDetails
}