import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";

// (soft) delete a request (identified by ID)
export default async function handler(req, res) {
    // connect to DB
    await connectMongo();

    switch (req.method) {
        case "PATCH":
            try {
                // get request ID from query (will be passed by dynamic endpoint functionality)
                const { requestId } = req.query;

                // retrieve and update request
                // setting { new: true } tells findByIdAndUpdate to return the updated document
                // (by default it returns the original document before the update)
                const updatedRequest = await Request.findByIdAndUpdate(
                    requestId,
                    { showSubTenant: false },
                    { new: true }
                );

                // error handling
                if (!updatedRequest) {
                    return res.status(404).json({ error: `APIError: Request not found.` });
                }

                // return
                res.status(200).json(updatedRequest);
            } catch (error) {
                res.status(500).json({ error: `APIError: Failed to delete request.\n${error}` });
            }
        default:
            res.setHeader("Allow", ["PATCH"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
