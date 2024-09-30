import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    addCampaign
} from "../controllers/campaign.controller.js";


const router = Router();

router
    .route("/addCampaign")
    .post(
        upload.array('images', 10),
        verifyJwt,
        addCampaign
    );

export default router