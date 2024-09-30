import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//middlewares configurations
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: '*', // Allows all HTTP methods
    allowedHeaders: '*' // Allows all headers
}))

//routes import
import ngoRouter from './routes/ngo.routes.js';
import projectRouter from './routes/project.routes.js';
import campaignRouter from './routes/campaign.routes.js';

//routes declaration
app.use("/api/v1/ngo", ngoRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/campaign", campaignRouter);


export { app }