import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";
import pusher from "../../../utils/pusher";

export default async function handler(req, res) {
    switch (req.method) {
        case "PUT":
            try {
                // connect to DB
                await connectMongo();

                // get info from req body
                const { requestId, listingId, newPrice, currentHighestBid } = req.body;

                // find and update request
                const updatedRequest = await Request.findOneAndUpdate(
                    { _id: requestId },
                    { $set: { price: newPrice } },
                    { new: true }
                );

                if (!updatedRequest) {
                    return res.status(404).json({ error: "Request to update not found." });
                }

                // trigger a pusher event (if new bid is higher than current highest bid)
                // if currentHighestBid doesn't exist, set it to 0
                console.log("triggered update");
                if (newPrice > currentHighestBid ?? 0) {
                    pusher.trigger(listingId, "request:update", {
                        listingId: listingId,
                        newHighestBid: newPrice,
                    });
                }

                // send back updated request
                res.status(200).json(updatedRequest);
            } catch (error) {
                console.error("Failed to update request.\n", error);
                res.status(500).json({ error: "Error updating request." });
            }
            break;
        default:
            res.setHeader("Allow", ["PUT"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
