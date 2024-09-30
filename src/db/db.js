import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(`\nDATABASE HOST: ${connect.connection.host}`);
        console.log(`DATABASE NAME: ${connect.connection.name}`);
    } catch (error) {
        console.log(`DATABASE CONNECTION FAILED: ${error}`);
        process.exit(1)
    }
}

export default connectDB