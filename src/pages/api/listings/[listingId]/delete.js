import connectMongo from "@/utils/connectMongo";
import Listing from "@/models/Listing";

// (soft) delete a request (identified by ID)
export default async function handler(req, res) {
    // connect to DB
    await connectMongo();

    switch (req.method) {
        case "DELETE":

            // Extract the listingId from the URL path
            const { listingId } = req.query;

            if (!listingId) {
                return res
                    .status(400)
                    .json({ error: "Listing ID is required" });
            }

            try {
                const deletedListing = await Listing.findByIdAndDelete(
                    listingId
                ).exec();

                if (!deletedListing) {
                    return res.status(404).json({ error: "Listing not found" });
                }

                res.status(200).json({
                    message: "Listing deleted successfully",
                });
            } catch (error) {
                console.error("Error deleting listing: ", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        default:
            res.setHeader("Allow", ["PATCH"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
