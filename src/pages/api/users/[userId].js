import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import User from "@/models/User";

export default async function handler(req, res) {
    // get userId from query
    const { userId } = req.query;

    // check if the userId is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ error: "User ID not valid" });
    }

    try {
        // connect to DB
        await connectMongo();

        // find the user by ID, including the password field
        const user = await User.findById(userId);

        // if no user found, return a 404
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if a password is set
        const hasPassword = !!user.password;

        // Convert the user document to a plain JavaScript object and exclude the password
        const userObj = user.toObject();
        delete userObj.password;

        // Add the hasPassword field
        userObj.hasPassword = hasPassword;

        // otherwise, return the found user (without the password) with 200 status code
        res.status(200).json(userObj);
    } catch (error) {
        console.error(`Failed to retrieve user.\n`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
