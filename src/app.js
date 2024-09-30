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

app.get("/api/v1/testing", (req, res) => {
    res.send("Successfully deployed");
})

//routes import
import ngoRouter from './routes/ngo.routes.js';

//routes declaration
app.use("/api/v1/ngo", ngoRouter);


export { app }