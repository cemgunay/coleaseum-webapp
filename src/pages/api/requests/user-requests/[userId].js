import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";
import DocumentModel from "@/models/Document";

// get all requests for a given user
export default async function handler(req, res) {
    // connect to DB
    await connectMongo();

    switch (req.method) {
        case "GET":
            try {
                // get user ID from query (will be passed by dynamic endpoint functionality)
                const { userId } = req.query;

                // get all requests
                const requests = await Request.find({ subTenantId: userId, showSubTenant: true })
                    .populate("tenantDocuments")
                    .populate("subtenantDocuments");

                // return
                res.status(200).json(requests);
            } catch (error) {
                res.status(500).json({ error: `APIError: Failed to get requests.\n${error}` });
            }
        // case "POST":
        //     // for later if we want to add filters
        default:
            // res.setHeader("Allow", ["GET", "POST"]);
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
