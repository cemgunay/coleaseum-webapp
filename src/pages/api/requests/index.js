import connectMongo from "@/utils/connectMongo";
import mongoose from "mongoose";
import Request from "@/models/Request";

// get all requests
export default async function handler(req, res) {
    // switch based on request method
    switch (req.method) {
        case "GET":
            try {
                // connect to DB
                await connectMongo();

                // get all requests
                const requests = await Request.find({});

                // return requests with 200 status code
                res.status(200).json(requests);
            } catch (error) {
                console.error(`Failed to retrieve all requests.\n`, error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        default:
            // got some method other than GET
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
