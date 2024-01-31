import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Message from "@/models/Message";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";

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

        // Fetch the conversation first
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Find the deletion timestamp for the user
        const userDeletion = conversation.deletedByUsers.find(
            (deletion) =>
                deletion && deletion.userId && deletion.userId.equals(userId)
        );
        const userDeletedAt = userDeletion
            ? userDeletion.deletedAt
            : new Date(0); // Use a very old date if no deletion

        // Fetch messages by conversationId and sort by createdAt, only those after the userDeletedAt timestamp
        const messages = await Message.find({
            conversationId: conversationId,
            createdAt: { $gt: userDeletedAt },
        })
            .sort({ createdAt: "asc" })
            .populate("sender")
            .populate("seen");

        if (messages.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(messages);
    } catch (error) {
        console.error(`Failed to retrieve messages: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
