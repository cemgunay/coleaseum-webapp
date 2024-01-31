import connectMongo from "@/utils/connectMongo";
import User from "@/models/User";
import Listing from "@/models/Listing";
import Conversation from "@/models/Conversation";
import mongoose from "mongoose";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import pusher from "@/utils/pusher";

export default async function handler(req, res) {
    await connectMongo();

    // Get the user session
    const session = await getServerSession(req, res, authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
        return res.status(400).json({ error: "Unauthorized" });
    }

    try {
        if (req.method === "POST") {
            const { userId, isGroup, members, name, listingId } = req.body;

            //check user authentication
            if (!currentUser) {
                return res.status(400).json({ error: "Unauthorized" });
            }

            //check if correct data is given
            if (isGroup && (!members || members.length < 2 || !name)) {
                return res.status(400).json({ error: "Invalid data" });
            }

            let userRoles = [];

            //if group is being called
            if (isGroup) {
                let listingOwner = null;

                // Check if listingId is provided and valid
                if (listingId) {
                    const listing = await Listing.findById(listingId);

                    if (!listing) {
                        return res
                            .status(400)
                            .json({ error: "Invalid Listing" });
                    }

                    listingOwner = listing.userId;
                }

                // Convert each member's 'value' property to a MongoDB ObjectId and assign roles the default is subtenant
                const memberIds = members.map((member) => {
                    const memberId = new mongoose.Types.ObjectId(member.value);

                    // Determine the role
                    let role = "subtenant";
                    if (
                        memberId.equals(currentUser._id) ||
                        (listingOwner && memberId.equals(listingOwner))
                    ) {
                        role = "tenant";
                    }

                    userRoles.push({ userId: memberId, role });
                    return memberId;
                });

                // Add the currentUser as a tenant if not already included
                if (!memberIds.some((id) => id.equals(currentUser._id))) {
                    const currentUserId = new mongoose.Types.ObjectId(
                        currentUser._id
                    );
                    userRoles.push({
                        userId: currentUserId,
                        role: "subtenant",
                    });
                    memberIds.push(currentUserId);
                }

                const newConversation = await Conversation.create({
                    name,
                    isGroup,
                    userIds: memberIds, // memberIds already include currentUser._id
                    users: memberIds, // Use the converted ObjectIds
                    listingId,
                    userRoles,
                });

                //populate new conversation
                const populatedConversation = await newConversation.populate(
                    "users"
                );

                //send an update to every user that is subscribed
                populatedConversation.userRoles.forEach((user) => {
                    if (user._id) {
                        pusher.trigger(
                            user.userId.toString(), // Convert ObjectId to string
                            "conversation:new",
                            {
                                conversation: populatedConversation,
                                userRole: user.role, // role of the user in this conversation
                            }
                        );
                    }
                });

                return res.status(200).json(newConversation);
            }

            //if non group...

            // Check if listingId is provided and valid
            if (listingId) {
                const listing = await Listing.findById(listingId);

                if (!listing) {
                    return res.status(400).json({ error: "Invalid Listing" });
                }
            }

            // Check for a non-group (direct) conversation between the two users
            const existingConversations = await Conversation.find({
                $and: [
                    { users: { $all: [currentUser._id, userId] } },
                    {
                        $or: [
                            { isGroup: false },
                            { isGroup: { $exists: false } },
                        ],
                    },
                    { listingId: listingId }, // Check for matching listingId
                ],
            });

            const singleConversation = existingConversations[0];

            //if there is a single conversation return that conversation
            if (singleConversation) {
                return res.status(200).json(singleConversation);
            }

            //if not push the default user roles with current user as subtenant and other user as tenant
            userRoles.push({ userId: currentUser._id, role: "subtenant" });
            userRoles.push({
                userId: new mongoose.Types.ObjectId(userId),
                role: "tenant",
            });

            //create the new conversatoin
            const newConversation = await Conversation.create({
                users: [currentUser._id, userId],
                userIds: [currentUser._id, userId],
                listingId: listingId,
                userRoles,
            });

            //populate the users property in the conversation
            const populatedConversation = await newConversation.populate(
                "users"
            );

            //send a pusher notification to everyone
            populatedConversation.users.forEach((user) => {
                if (user._id) {
                    pusher.trigger(
                        user._id.toString(),
                        "conversation:new",
                        populatedConversation
                    );
                }
            });

            return res.status(200).json(newConversation);
        } else if (req.method === "PUT") {
            // PUT logic for updating a conversation
            const { conversationId, newMembers, newListingId } = req.body;

            if (!conversationId) {
                return res
                    .status(400)
                    .json({ error: "Conversation ID is required" });
            }

            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                return res
                    .status(404)
                    .json({ error: "Conversation not found" });
            }

            // Check if the current user is part of the conversation
            if (!conversation.users.includes(currentUser._id)) {
                return res.status(403).json({ error: "Access denied" });
            }

            // Add new members
            if (newMembers && newMembers.length > 0) {
                const memberObjectIds = newMembers.map(
                    (member) => new mongoose.Types.ObjectId(member)
                );
                conversation.users.push(...memberObjectIds);
                conversation.userIds.push(...memberObjectIds);
                // add default roles for new members
                newMembers.forEach((member) => {
                    conversation.userRoles.push({
                        userId: member,
                        role: "subtenant",
                    });
                });
            }

            // Update listingId and userRoles
            if (newListingId) {
                const listing = await Listing.findById(newListingId);
                if (!listing) {
                    return res
                        .status(400)
                        .json({ error: "Invalid Listing ID" });
                }
                conversation.listingId = newListingId;

                // Get the owner of the new listing
                const listingOwner = listing.userId;

                // Update userRoles based on the new listing
                conversation.userRoles = conversation.userRoles.map(
                    (userRole) => {
                        if (userRole.userId.equals(listingOwner)) {
                            return { ...userRole, role: "tenant" }; // Update role to 'tenant' for the listing owner
                        }
                        return { ...userRole, role: "subtenant" }; // Ensure others are 'subtenants'
                    }
                );
            }

            // Save the updated conversation
            await conversation.save();

            // Notify conversation about the update
            pusher.trigger(conversationId, "conversation:update", {
                conversation,
                newMembers,
                newListingId,
            });

            return res.status(200).json(conversation);
        } else {
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("ERROR_CONVERSATION", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
