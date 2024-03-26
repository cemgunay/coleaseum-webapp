import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose"; // Import mongoose to use transactions
import Request from "@/models/Request";
import BookingModel from "@/models/Booking";
import Listing from "@/models/Listing";

export default async function handler(req, res) {
    await connectMongo();

    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction(); // Start the transaction

    try {
        const { requestId } = req.query;

        // Ensure the request exists
        const request = await Request.findById(requestId).session(session);
        if (!request) {
            throw new Error(`APIError: Request not found.`);
        }

        // Ensure the listing exists
        const listing = await Listing.findById(request.listingId).session(
            session
        );
        if (!listing) {
            throw new Error(`APIError: Listing not found.`);
        }

        // Update the listing to mark it as booked
        await Listing.findByIdAndUpdate(
            request.listingId,
            { isBooked: true, published: false },
            { new: true, session } // Include the session in the update operation
        );

        // Reject all other requests for the listing
        await Request.updateMany(
            { listingId: request.listingId, _id: { $ne: requestId } },
            { status: "rejected" },
            { session } // Include the session in the update operation
        );

        // Update the selected request status to "accepted"
        const updatedRequest = await Request.findByIdAndUpdate(
            requestId,
            { status: "accepted" },
            { new: true, session } // Include the session in the update operation
        );

        // Prepare and create the booking
        const bookingDetails = {
            tenantId: request.tenantId, // Assuming the tenant ID is part of the request
            subTenantId: request.subTenantId, // Assuming the sub-tenant ID is part of the request, if applicable
            listingId: request.listingId, // The ID of the listing being booked
            acceptedRequestId: requestId, // The ID of the request being accepted
            acceptedPrice: request.price, // Assuming the agreed price is part of the request
            moveInDate: listing.moveInDate, // Use move-in date from the listing
            moveOutDate: listing.moveOutDate, // Use move-out date from the listing
        };

        const newBooking = await BookingModel.create([bookingDetails], {
            session,
        }); // Create with session

        // If everything was successful, commit the transaction
        await session.commitTransaction();

        // Return response
        res.status(200).json({ updatedRequest, newBooking });
    } catch (error) {
        // If there's an error, abort the transaction
        await session.abortTransaction();

        res.status(500).json({ error: `APIError: ${error.message}` });
    } finally {
        // End the session
        session.endSession();
    }
}
