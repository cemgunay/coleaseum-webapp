import connectMongo from "@/utils/connectMongo";
import Listing from "@/models/Listing";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const userId = req.query.userId;
    
    try {
        await connectMongo();

        const listings = await Listing.find({ userId, isBooked: true });

        res.status(200).json(listings);
    } catch (error) {
        console.error("Error fetching booked listings:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
