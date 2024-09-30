import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    registerNGO,
    loginNGO,
    logoutNGO,
    updateNGODetails,
    updateOrUploadCoverImage,
    updateOrUploadAvatar,
    getDetails
} from "../controllers/ngo.controller.js";


const router = Router();


router
    .route("/register")
    .post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerNGO);



router
    .route("/login")
    .post(
        loginNGO
    )

router
    .route("/logout")
    .post(
        verifyJwt,
        logoutNGO
    )

router
    .route("/update-details")
    .patch(
        verifyJwt,
        updateNGODetails
    )

router
    .route("/update-avatar")
    .patch(
        verifyJwt,
        upload.single("avatar"),
        updateOrUploadAvatar
    )

router
    .route("/update-cover-image")
    .patch(
        verifyJwt,
        upload.single("coverImage"),
        updateOrUploadCoverImage
    )

router
    .route("/getDetails")
    .get(
        verifyJwt,
        getDetails
    )

export default router