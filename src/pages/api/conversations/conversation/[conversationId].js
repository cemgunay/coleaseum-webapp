import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Conversation from "@/models/Conversation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
    const { conversationId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(404).json({ error: "Conversation ID not valid" });
    }

    try {
        await connectMongo();

        // Get the user session
        const session = await getServerSession(req, res, authOptions);

        // Check if the user is authenticated
        if (!session || !session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = session.user.id;

        // Use a single query to find and populate
        const conversation = await Conversation.findById(
            conversationId
        ).populate("users");

        // Check if the conversation exists
        if (!conversation) {
            return res.status(403).json({ error: "Conversation not found" });
        }

        // Find the deletion record for this user
        const userDeletion = conversation.deletedByUsers.find(
            (deletion) => deletion.userId.toString() === userId
        );

        if (!userDeletion) {
            return res.status(200).json(conversation);
        }

        // Check if there are messages after the user's last soft deletion
        if (
            userDeletion &&
            conversation.lastMessageAt > userDeletion.deletedAt
        ) {
            // There are new messages since the user's last soft delete
            return res.status(200).json(conversation);
        }

        res.status(403).json({ error: "Nothing exists here..." });
    } catch (error) {
        console.error(`Failed to retrieve conversation: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
