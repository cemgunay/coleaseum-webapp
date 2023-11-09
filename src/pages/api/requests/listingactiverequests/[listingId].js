import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";
import Document from "@/models/Document";

// get active requests by ID
export default async function handler(req, res) {
    // ensure request is a GET
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // connect to DB
        await connectMongo();

        // get listing ID from query (will be pased by dynamic endpoint functionality)
        const { listingId } = req.query;

        // get active requests (original code had a comment saying "Add this line" here. not sure why)
        const requests = await Request.find({ listingId, status: { $ne: "rejected" } })
            .populate("tenantDocuments")
            .populate("subtenantDocuments");

        res.status(200).json(requests);
    } catch (error) {
        console.error("Failed to retrieve active requests from DB.\n", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
