import connectMongo from "@/utils/connectMongo";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import pusher from "@/utils/pusher";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
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

        // Extract conversationId from the request
        const { conversationId } = req.query;

        // Find existing conversation
        const conversation = await Conversation.findById(conversationId)
            .populate({
                path: "messages",
                populate: { path: "seen" },
            })
            .populate("users");

        if (!conversation) {
            return res.status(400).json({ error: "Invalid ID" });
        }

        // Find last message
        const lastMessage =
            conversation.messages[conversation.messages.length - 1];

        if (!lastMessage) {
            return res.status(200).json(conversation);
        }

        // Update seen of last message
        const updatedMessage = await Message.findByIdAndUpdate(
            lastMessage._id,
            { $addToSet: { seenIds: userId, seen: userId } },
            { new: true } // Return the updated document
        ).populate("sender seen"); // Populate the sender field

        // Pusher logic here
        await pusher.trigger(userId, "conversation:update", {
            _id: conversationId,
            messages: [updatedMessage],
        });

        // If user has already seen the message, no need to go further
        if (lastMessage.seenIds.indexOf(userId) !== -1) {
            return res.status(200).json(conversation);
        }

        // Update last message seen
        await pusher.trigger(conversationId, "message:update", updatedMessage);

        return res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error("ERROR_MESSAGES_SEEN", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
