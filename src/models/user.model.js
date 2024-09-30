import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const UserSchema = new Schema(
    {
        fname: {
            type: String,
            required: true,
            trim: true
        },
        mname: {
            type: String,
            required: false,
            trim: true
        },
        lname: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^([\w-]+(?:\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,})$/.test(v); // Support for longer TLDs

                },
                message: props => `${props.value} is not a valid email!`
            }
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
            minlength: [8, "Password should be atleast 8 characters long"]
        },
        role: {
            type: String,
            enum: ['volunteer', 'normal'],
            default: 'normal'
        },
        avatar: {
            publicId: {
                type: String
            },
            secureUrl: {
                type: String
            }
        },
        location: {
            city: {
                type: String,
                trim: true,
                required: function () {
                    return this.role === 'volunteer';
                }
            },
            state: {
                type: String,
                trim: true,
                required: function () {
                    return this.role === 'volunteer';
                }
            },
            country: {
                type: String,
                trim: true,
                required: function () {
                    return this.role === 'volunteer';
                }
            }
        },
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return /^\+?[1-9]\d{1,14}$/.test(v); // Basic phone number validation
                },
                message: props => `${props.value} is not a valid phone number!`
            },
            required: true
        },

        // Fields for volunteer-specific data  
        volunteerData: {
            skills: {
                type: [String],
                enum: [
                    "Accounting", "Advocacy", "Animal Care", "App Development",
                    "Arts and Crafts", "Audio Editing", "Blogging", "Bookkeeping",
                    "Budgeting", "Campaign Management", "Carpentry",
                    "Community Outreach", "Construction", "Content Marketing",
                    "Content Writing", "Cooking", "Counseling", "CPR",
                    "Crowdfunding", "Crisis Management", "Customer Service",
                    "Data Analysis", "Database Management", "Disaster Management",
                    "Disaster Relief", "Diversity Training", "Donor Relations",
                    "Editing", "Elder Care", "Email Marketing",
                    "Emergency Response", "Energy Conservation",
                    "Environmental Conservation", "Event Planning",
                    "Event Promotion", "Event Coordination",
                    "Financial Literacy", "Financial Planning", "First Aid",
                    "Fundraising", "Gardening", "Grant Writing",
                    "Graphic Design", "Healthcare Assistance", "HTML/CSS",
                    "IT Management", "JavaScript", "Leadership", "Legal Assistance",
                    "Logistics", "Marketing", "Mediation", "Mental Health Support",
                    "Mentoring", "Newsletter Management", "Nutrition Counseling",
                    "Peer Support", "Permaculture", "Photography",
                    "Plumbing", "Podcasting", "Programming",
                    "Project Management", "Proposal Writing", "Public Health",
                    "Public Relations", "Public Speaking", "Python",
                    "Research", "SEO (Search Engine Optimization)",
                    "Shelter Operations", "Social Media Management", "Social Work",
                    "Sustainable Development", "Teaching", "Teamwork",
                    "Technical Support", "Time Management", "Translation",
                    "Transportation", "Tutoring", "UX/UI Design",
                    "Veterinary Assistance", "Video Editing", "Videography",
                    "Volunteer Coordination", "Volunteer Management",
                    "Water Conservation", "Website Development",
                    "Wildlife Conservation", "Youth Mentoring"
                ]
            },
            availability: [
                {
                    startDate: { type: Date, required: true },
                    endDate: { type: Date, required: true }
                }
            ],
            projectsVolunteered: [
                {
                    project_id: {
                        type: Schema.Types.ObjectId,
                        required: true,
                        ref: 'Project'
                    },
                }
            ],
        },
    },
    {
        timestamps: true
    }
);
// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 5);
    next();
});

// Method to compare password
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email // You can include any additional info you need
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};
export const User = mongoose.model('User', UserSchema);