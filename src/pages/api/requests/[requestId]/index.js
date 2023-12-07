import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Request from "@/models/Request";

// get request by ID
export default async function handler(req, res) {
    // switch based on request method
    switch (req.method) {
        case "GET":
            // get request ID from query (will be passed by dynamic endpoint functionality)
            const { requestId } = req.query;

            // check if the requestId is a valid Mongo ObjectId
            if (!mongoose.Types.ObjectId.isValid(requestId)) {
                return res.status(404).json({ error: "Request ID not valid" });
            }

            try {
                // connect to DB
                await connectMongo();

                // find the request by ID
                const request = await Request.findById(requestId);

                // if no request found, return a 404
                if (!request) {
                    return res.status(404).json({ error: "Request not found" });
                }

                // otherwise, return the found request with 200 status code
                res.status(200).json(request);
            } catch (error) {
                console.error(`Failed to retrieve request.\n`, error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        default:
            // got some method other than GET
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
