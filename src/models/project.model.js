import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true,
            maxlength: 500 // Limit the description length for production use
        },
        ngoId: {
            type: Schema.Types.ObjectId,
            ref: 'NGO', // Reference to the NGO model
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        location: {
            city: {
                type: String,
                trim: true,
                required: true
            },
            state: {
                type: String,
                trim: true,
                required: true
            },
            country: {
                type: String,
                trim: true,
                required: true
            }
        },
        volunteersAssigned: [
            {
                volunteerId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User', // Reference to the User model (volunteer)
                    required: true
                },
                assignedDate: {
                    type: Date,
                    default: Date.now // Automatically set the date when assigned
                },
                tasks: [
                    {
                        description: {
                            type: String,
                            required: true
                        },
                        assignedTime: {
                            type: Date, // Store the time when the task is assigned
                            required: true
                        },
                        dueTime: {
                            type: Date, // Store the due time for the task
                            required: true
                        },
                        status: {
                            type: String,
                            enum: ['pending', 'in progress', 'completed'],
                            default: 'pending' // Default status for new tasks
                        }
                    }
                ]
            }
        ],
        resourcesNeeded: [
            {
                resourceType: {
                    type: String,
                    required: true // Type of resource needed
                },
                quantityNeeded: {
                    type: Number,
                    required: true,
                    min: 0
                },
                quantityFulfilled: {
                    type: Number,
                    default: 0,
                    min: 0,
                    validate: {
                        validator: function (v) {
                            return v <= this.quantityNeeded; // Fulfilled quantity cannot exceed needed quantity
                        },
                        message: props => `Fulfilled quantity cannot exceed needed quantity (${this.quantityNeeded})`
                    }
                },
                status: {
                    type: String,
                    enum: ['fulfilled', 'not fulfilled'],
                    default: 'not fulfilled' // Set status based on fulfillment
                }
            }
        ],
        skillsNeeded: [
            {
                type: String,
                required: true
            }
        ],
        images: [{
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

ProjectSchema.path('images').validate(function (value) {
    return value.length <= 10; // Maximum 10 images allowed
}, 'A project can have a maximum of 10 images.');

// Create the Project model
export const Project = mongoose.model('Project', ProjectSchema);