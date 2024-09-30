import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    addProject
} from "../controllers/project.controller.js";


const router = Router();

router
    .route("/addProject")
    .post(
        upload.array('images', 10),
        verifyJwt,
        addProject
    );

export default router