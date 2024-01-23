import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";
import pusher from "../../../utils/pusher";

// create new request
export default async function handler(req, res) {
    switch (req.method) {
        case "POST":
            try {
                // connect to DB
                await connectMongo();

                // get listing/user/price info from req body
                const { listingId, tenantId, subTenantId, price } = req.body;

                // create new request
                const newRequest = new Request({
                    listingId,
                    tenantId,
                    subTenantId,
                    price,
                    status: "pending",
                });

                await newRequest.save();

                // trigger a pusher event
                console.log("triggered create");
                pusher.trigger("requests-channel", "request-created", {
                    listingId: listingId,
                });

                // send back newly created request
                res.status(201).json(newRequest);
            } catch (error) {
                console.error("Failed to create new request.\n", error);
                res.status(500).json({ error: "Error creating new request." });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
