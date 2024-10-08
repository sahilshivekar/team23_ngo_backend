import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const NGOSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: [500, 'Description cannot exceed 500 characters.']
        },
        contact: {
            phone: {
                type: String,
                validate: {
                    validator: function (v) {
                        return /^\+?[1-9]\d{1,14}$/.test(v);
                    },
                    message: props => `${props.value} is not a valid phone number!`
                }
            },
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
                validate: {
                    validator: function (v) {
                        return /^([\w-]+(?:\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,})$/.test(v);
                    },
                    message: props => `${props.value} is not a valid email!`
                }
            },
            social_media: {
                facebook: String,
                twitter: String,
                linkedin: String,
                instagram: String
            }
        },
        address: {
            addressLine1: {
                type: String,
                required: [true, 'Address Line 1 is required.'],
                maxlength: [50, 'Address Line 1 cannot exceed 50 characters.']
            },
            addressLine2: {
                type: String,
                required: false,
                maxlength: [50, 'Address Line 2 cannot exceed 50 characters.']
            },
            city: {
                type: String,
                required: [true, 'City is required.'],
                maxlength: [50, 'City cannot exceed 50 characters.']
            },
            state: {
                type: String,
                required: [true, 'State is required.'],
                maxlength: [50, 'State cannot exceed 50 characters.']
            },
            country: {
                type: String,
                required: [true, 'Country is required.'],
                maxlength: [50, 'Country cannot exceed 50 characters.']
            },
            postalCode: {
                type: String,
                required: [true, 'Postal code is required.']
            }
        },
        website: {
            type: String,
            required: false
        },
        projects: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Project'
            }
        ],
        campaigns: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Campaign'
            }
        ],
        registrationNumber: {
            type: String,
            required: true,
            unique: true
        },
        avatar: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
        coverImage: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: [8, 'Password must be at least 8 characters long.']
        },
    },
    {
        timestamps: true
    }
);


NGOSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 5);
    next();
})

NGOSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

NGOSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            registrationNumber: this.registrationNumber
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const NGO = mongoose.model('NGO', NGOSchema);