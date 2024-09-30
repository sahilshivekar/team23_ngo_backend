import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    updateUserDetails,
    updateOrUploadAvatar,
    getUserDetails
} from "../controllers/user.controller.js";

const router = Router();

router
    .route("/register")
    .post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            }
        ]),
        registerUser
    );

router
    .route("/login")
    .post(
        loginUser
    );

router
    .route("/logout")
    .get(
        verifyJwt,
        logoutUser
    );

router
    .route("/update-details")
    .patch(
        verifyJwt,
        updateUserDetails
    );

router
    .route("/update-avatar")
    .patch(
        verifyJwt,
        upload.single("avatar"),
        updateOrUploadAvatar
    );

router
    .route("/getDetails")
    .get(
        verifyJwt,
        getUserDetails
    );

export default router;
