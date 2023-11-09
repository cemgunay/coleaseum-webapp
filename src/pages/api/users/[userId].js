import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import User from "@/models/User";

export default async function handler(req, res) {
    // get userId from query
    const { userId } = req.query;

    // check if the userId is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ message: "User ID not valid" });
    }

    try {
        // connect to DB
        await connectMongo();

        // find the user by ID
        const user = await User.findById(userId).select("-password"); // Exclude the password field

        // if no user found, return a 404
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // otherwise, return the found user with 200 status code
        res.status(200).json(user);
    } catch (error) {
        console.error(`Failed to retrieve user.\n`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
