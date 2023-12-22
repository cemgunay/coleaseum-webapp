import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Listing from "@/models/Listing";

// get all published listings for a user
export default async function handler(req, res) {
    // switch based on request method
    switch (req.method) {
        case "GET":
            // get user ID from query (will be passed by dynamic endpoint functionality)
            const { userId } = req.query;

            // check if the userId is a valid Mongo ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(404).json({ error: "User ID not valid" });
            }

            try {
                // connect to DB
                await connectMongo();

                // get all published listings for the user, with those listings' requests attached
                const listingsWithRequests = await Listing.aggregate([
                    { $match: { userId, published: true } },
                    {
                        $lookup: {
                            from: "requests", // the collection to join
                            localField: "_id", // field from the source collection (listings)
                            foreignField: "listingId", // field from the foreign collection (requests)
                            as: "requests", // name of field to hold the joined data
                        },
                    },
                ]);

                // return the listings with 200 status code
                res.status(200).json(listingsWithRequests);
            } catch (error) {
                console.error(`Failed to retrieve listings:\n`, error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        default:
            // got some method other than GET
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
