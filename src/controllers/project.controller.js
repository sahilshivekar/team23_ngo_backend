import { asyncHandler } from "../utils/asyncHandler.js";
import { NGO } from "../models/ngo.model.js";
import { Campaign } from "../models/campaign.model.js";
import { Project } from "../models/project.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import mongoose from "mongoose";
import { log } from "console";


const deleteUploadedFiles = (files) => {
    if (files) {
        files.forEach(file => {
            fs.unlinkSync(file?.path);
        });
    }
};

const addProject = asyncHandler(async (req, res) => {

    const {
        title,
        description,
        startDate,
        endDate,
        city,
        state,
        country,
    } = req.body;

    const resourcesNeeded = JSON.parse(req.body?.resourcesNeeded || '[]');

    const mandatoryFields = {
        title,
        description,
        startDate,
        endDate,
        city,
        state,
        country
    };
    // console.log(resourcesNeeded);

    for (const [key, value] of Object.entries(mandatoryFields)) {
        if (!value || value.trim() === "") {
            deleteUploadedFiles(req?.files);
            throw new ApiError(400, `${key} field is mandatory`);
        }
    }

    resourcesNeeded.forEach((resource, index) => {
        if (!resource.resourceType || resource.resourceType.trim() === "") {
            deleteUploadedFiles(req?.files);
            throw new ApiError(400, `Resource type is mandatory for resource at index ${index}`);
        }
        if (resource.quantityNeeded === undefined || resource.quantityNeeded < 0) {
            deleteUploadedFiles(req?.files);
            throw new ApiError(400, `Quantity needed should be a non-negative number for resource at index ${index}`);
        }
    });

    let images = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => {
            return uploadOnCloudinary(file.path);
        });

        // Wait for all uploads to complete
        images = await Promise.all(uploadPromises);
    }
    console.log(images)
    const newProject = await Project.create({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: {
            city,
            state,
            country
        },
        resourcesNeeded: resourcesNeeded,
        images: req.files && req.files.length > 0 ? images.map(image => ({
            publicId: image.public_id,
            secureUrl: image.secure_url
        })) : [],
        ngoId: req?.ngo?._id
    });

    const projectData = await Project.findById(newProject._id);

    if (!projectData) {
        throw new ApiError(500, "Something went wrong while adding project");
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                projectData)
        );
})

export {
    addProject
}