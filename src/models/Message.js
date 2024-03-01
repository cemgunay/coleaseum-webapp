import mongoose from "mongoose";

const { Schema, ObjectId } = mongoose;

const MessageSchema = new Schema(
    {
        body: { type: String },
        image: { type: String },

        conversationId: { type: ObjectId, ref: "Conversation", required: true },
        conversation: { type: ObjectId, ref: "Conversation" },

        senderId: { type: ObjectId, ref: "User", required: true },
        sender: { type: ObjectId, ref: "User" },

        seenIds: [{ type: ObjectId, ref: "User" }],
        seen: [{ type: ObjectId, ref: "User" }],

        type: { type: String, enum: ["system", "user"] },
    },
    {
        timestamps: true,
    }
);

const MessageModel =
    mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default MessageModel;
