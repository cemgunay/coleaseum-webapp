import connectMongo from "@/utils/connectMongo";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

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

        // Extract user ID or email from the session
        const userId = session.user.id; // or session.user.email, depending on your setup

        const { message, image, conversationId } = req.body;

        const newMessage = await Message.create({
            body: message,
            image: image,
            conversationId: conversationId,
            senderId: userId,
            sender: userId,
            seen: [userId],
            seenIds: [userId],
            type: "user",
        });

        const populatedMessage = await newMessage.populate("sender seen");

        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            {
                $set: { lastMessageAt: new Date() },
                $push: { messages: populatedMessage._id },
            },
            { new: true }
        ).populate("users messages");

        await pusher.trigger(conversationId, "messages:new", populatedMessage);

        const lastMessage =
            updatedConversation.messages[
                updatedConversation.messages.length - 1
            ];

        updatedConversation.users.forEach(async (user) => {
            if (user?._id) {
                const channelId = user._id.toString();
                await pusher.trigger(channelId, "conversation:update", {
                    _id: conversationId,
                    messages: [lastMessage],
                });
            }
        });

        return res.status(200).json(newMessage);
    } catch (error) {
        console.error("ERROR_MESSAGES", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
