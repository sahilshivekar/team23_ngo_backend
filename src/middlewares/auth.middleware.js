// import { User } from "../models/user.model.js";
import { NGO } from "../models/ngo.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const verifyJwt = asyncHandler(async (req, _, next) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    const decodedUser = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (decodedUser.registrationNumber) {
        const ngo = await NGO.findOne({ registrationNumber: decodedUser.registrationNumber }).select("-password");
        if (!ngo) {
            throw new ApiError(401, "Invalid access token for NGO");
        }
        req.ngo = ngo;
    } else {
        // const user = await User.findById(decodedUser._id).select("-password");
        // if (!user) {
        //     throw new ApiError(401, "Invalid access token for User");
        // }
        // req.user = user;
    }

    next();
});


export { verifyJwt }