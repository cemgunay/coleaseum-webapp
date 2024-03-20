import connectMongo from "@/utils/connectMongo";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import pusher from "@/utils/pusher";

export default async function systemMessageHandler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        await connectMongo();

        // Get the user session for authentication (optional based on your system's logic)
        const session = await getServerSession(req, res, authOptions);

        // Check if the user is authenticated (optional based on your system's logic)
        if (!session || !session.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { systemMessage, conversationId } = req.body;

        const newSystemMessage = await Message.create({
            body: systemMessage, // The message about the system event
            conversationId: conversationId,
            senderId: "65b7db1be58efe9b30916807",
            sender: "65b7db1be58efe9b30916807",
            type: "system",
        });

        const populatedMessage = await newSystemMessage.populate(
            "conversation"
        );

        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                $set: { lastMessageAt: new Date() },
                $push: { messages: populatedMessage._id },
            },
            { new: true }
        )

        await pusher.trigger(conversationId, "messages:new", populatedMessage);

        return res.status(200).json(newSystemMessage);
    } catch (error) {
        console.error("ERROR_SYSTEM_MESSAGES", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
