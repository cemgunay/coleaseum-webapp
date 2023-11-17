import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Listing from "@/models/Listing";

export default async function handler(req, res) {
    // get listing ID from query
    const { listingId } = req.query;

    // check if the listingId is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
        return res.status(404).json({ error: "Listing ID not valid" });
    }

    try {
        // connect to DB
        await connectMongo();

        // find the listing by ID
        const listing = await Listing.findById(listingId);

        // if no listing found, return a 404
        if (!listing) {
            return res.status(404).json({ error: "Listing not found" });
        }

        // otherwise, return the found listing with 200 status code
        res.status(200).json(listing);
    } catch (error) {
        console.error(`Failed to retrieve listing.\n`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
