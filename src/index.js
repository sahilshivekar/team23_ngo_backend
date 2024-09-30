import dotenv from "dotenv"
import connectDB from "./db/db.js";
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 4000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`SERVER RUNNING ON PORT: ${port}\n`);
        })
    })
    .catch(err => {
        console.log(`ERROR OCCURED WHILE RUNNING THE SERVER: ${err}`);
    })