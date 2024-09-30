import mongoose, { Schema } from "mongoose";

const CampaignSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 500 // Limit the description length for production use
        },
        targetAmount: {
            type: Number,
            required: true,
            min: 0 // Ensure target amount is non-negative
        },
        raisedAmount: {
            type: Number,
            default: 0 // Start with zero raised amount
        },
        currency: {
            type: String,
            required: true,
            enum: ['USD', 'EUR', 'INR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'BRL', 'MXN'], 
            default: 'INR' 
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        ngoId: {
            type: Schema.Types.ObjectId,
            ref: 'NGO', // Reference to the NGO model
            required: true
        },
        projects: [{ // Array of project IDs
            type: Schema.Types.ObjectId,
            ref: 'Project' // Reference to the Project model
        }],
        images: [{ // Array to store multiple images
            publicId: {
                type: String
            },
            secureUrl: {
                type: String
            }
        }]
    },
    {
        timestamps: true // Automatically create createdAt and updatedAt fields
    }
);

CampaignSchema.path('images').validate(function (value) {
    return value.length <= 10; // Maximum 10 images allowed
}, 'A campaign can have a maximum of 10 images.');

// Create the Campaign model
export const Campaign = mongoose.model('Campaign', CampaignSchema);
