import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localpath) => {
    try {
        if (!localpath) throw Error("file path is missing");
        const res = await cloudinary.uploader.upload(
            localpath,
            {
                resource_type: "auto"
            }
        );
        fs.unlinkSync(localpath);
        return res;
    } catch (err) {
        fs.unlinkSync(localpath);
        return err;
    }
}


const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) throw Error("publicId is missing");
        const res = await cloudinary.uploader.destroy(publicId);
        return res;
    } catch (err) {
        return err;
    }
}


export {
    uploadOnCloudinary,
    deleteFromCloudinary
}