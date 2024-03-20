import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Conversation from "@/models/Conversation";
import User from "@/models/User";
import Message from "@/models/Message";

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ error: "User ID not valid" });
    }

    try {
        await connectMongo();

        // Convert userId string to ObjectId
        const objectIdUserId = new mongoose.Types.ObjectId(userId);

        // Use a single query to find conversations where the user is a subtenant
        let conversations = await Conversation.find({
            userRoles: {
                $elemMatch: { userId: objectIdUserId, role: "tenant" },
            },
            userIds: userId,
        })
            .sort({ lastMessageAt: -1 })
            .populate("users")
            .populate("messages");

        // Filter out conversations where the user's deletion is more recent than the last message
        conversations = conversations.filter((conversation) => {
            const userDeletion = conversation.deletedByUsers.find(
                (deletion) => deletion.userId.toString() === userId
            );

            return (
                !userDeletion ||
                userDeletion.deletedAt < conversation.lastMessageAt
            );
        });

        if (conversations.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(conversations);
    } catch (error) {
        console.error(`Failed to retrieve conversations: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
