import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";
import Document from "@/models/Document";

// get all requests for a specific listing (by listing ID)
export default async function handler(req, res) {
    // ensure request is a GET
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // connect to DB
        await connectMongo();

        // get listing ID from query (will be passed by dynamic endpoint functionality)
        const { listingId } = req.query;

        // get all requests
        const requests = await Request.find({ listingId, showSubTenant: true })
            .populate("tenantDocuments")
            .populate("subtenantDocuments");

        res.status(200).json(requests);
    } catch (error) {
        console.error("Failed to retrieve requests from DB.\n", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
