import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import User from "@/models/User";

export default async function handler(req, res) {
    const { userId } = req.query;

    // Split the userId string into an array of IDs
    const userIds = userId ? userId.split(",") : [];

    // Check if all userIds are valid Mongo ObjectIds
    if (!userIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        return res
            .status(400)
            .json({ error: "One or more User IDs are not valid" });
    }

    try {
        await connectMongo();

        // Modify the query to exclude all userIds using $nin
        const users = await User.find({ _id: { $nin: userIds } })
            .select("-password")
            .sort({ updatedAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        console.error(`Failed to retrieve users.\n`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
