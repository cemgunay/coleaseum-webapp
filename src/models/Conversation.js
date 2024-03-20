import mongoose from "mongoose";
import "@/models/Message";
import "@/models/User";

const { Schema, ObjectId } = mongoose;

const UserRoleInConversation = new Schema({
    userId: { type: ObjectId, ref: "User" },
    role: { type: String, enum: ["tenant", "subtenant"] }, // Include 'tenant' and 'subTenant'
});

const UserDeletionSchema = new Schema({
    userId: { type: ObjectId, ref: "User" },
    deletedAt: { type: Date, default: Date.now }, // Timestamp of deletion
});

const ConversationSchema = new Schema(
    {
        lastMessageAt: { type: Date, default: Date.now },
        name: String,
        isGroup: Boolean,

        messagesIds: [{ type: ObjectId, ref: "Message" }],
        messages: [{ type: ObjectId, ref: "Message" }],

        listingId: { type: ObjectId, ref: "Listing" },

        userIds: [{ type: ObjectId, ref: "User" }],
        users: [{ type: ObjectId, ref: "User" }],
        userRoles: [UserRoleInConversation],

        deletedByUsers: [UserDeletionSchema],
    },
    {
        timestamps: true,
    }
);

ConversationSchema.methods.softDeleteByUser = function (userId) {
    const userDeletionIndex = this.deletedByUsers.findIndex(
        (deletion) =>
            deletion && deletion.userId && deletion.userId.equals(userId)
    );

    // Check if the user has already soft deleted the conversation
    if (userDeletionIndex === -1) {
        // If the user hasn't soft deleted it before, add them with the current timestamp
        this.deletedByUsers.push({ userId, deletedAt: new Date() });
    } else {
        // If the user has already soft deleted it, update the timestamp
        this.deletedByUsers[userDeletionIndex].deletedAt = new Date();
    }

    return this.save(); // Save the changes
};

const ConversationModel =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);

export default ConversationModel;
