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

const addCampaign = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        targetAmount,
        startDate,
        endDate,
    } = req.body;

    const projects = JSON.parse(req.body?.projects || '[]');

    if (projects.length < 1) {
        deleteUploadedFiles(req?.files);
        throw new ApiError(400, `At least one project is required`);
    }

    const mandatoryFields = {
        title,
        description,
        targetAmount,
        startDate,
        endDate,
    };

    for (const [key, value] of Object.entries(mandatoryFields)) {
        if (!value || value.trim() === "") {
            deleteUploadedFiles(req?.files);
            throw new ApiError(400, `${key} field is mandatory`);
        }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
        throw new ApiError(400, "End date must be after the start date");
    }

    let images = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => {
            return uploadOnCloudinary(file.path);
        });

        images = await Promise.all(uploadPromises);
    }

    const newCampaign = await Campaign.create({
        title,
        description,
        targetAmount,
        raisedAmount: 0,
        startDate: start,
        endDate: end,
        ngoId: req?.ngo?._id,
        images: req.files && req.files.length > 0 ? images.map(image => ({
            publicId: image.public_id,
            secureUrl: image.secure_url
        })) : [],
        projects
    });

    const campaignData = await Campaign.findById(newCampaign._id);

    if (!campaignData) {
        throw new ApiError(500, "Something went wrong while adding campaign");
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Campaign Added successfully",
                campaignData
            ));
});

const getActiveProjects = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;

    // Validate input dates
    if (!startDate || !endDate) {
        throw new ApiError(400, "Both startDate and endDate are required.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // Validate date logic
    if (end <= start) {
        throw new ApiError(400, "End date must be after start date.");
    }

    // Find projects that have started today or before and end after today
    const projects = await Project.find({
        startDate: { $lte: today },
        endDate: { $gt: today }
    }).populate('images');

    // Format response data
    const responseProjects = projects.map(project => ({
        projectId: project._id,
        title: project.title,
        description: project.description,
        image: project.images.length > 0 ? project.images[0].secureUrl : null // Get first image or null if none
    }));

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Active projects data sent successfully",
                responseProjects
            ));
});


export { addCampaign, getActiveProjects };
