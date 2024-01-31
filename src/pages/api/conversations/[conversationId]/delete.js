import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Message from "@/models/Message";
import User from "@/models/User";
import Conversation from "@/models/Conversation"; // Import the Conversation model
import { authOptions } from "../../auth/[...nextauth]";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
    // Only allow DELETE requests
    if (req.method !== "PUT") {
        res.setHeader("Allow", "DELETE");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

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

        // Extract user ID from the session
        const userId = session.user.id;

        // Fetch the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Convert ObjectIds in userIds to strings for comparison
        const participantIds = conversation.userIds.map((id) => id.toString());

        // Check if the user is a participant of the conversation
        if (!participantIds.includes(userId)) {
            return res.status(403).json({
                error: "User is not a participant of this conversation",
            });
        }

        // Soft delete the conversation for this user
        await conversation.softDeleteByUser(userId);

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error(`Failed to soft delete conversation: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
