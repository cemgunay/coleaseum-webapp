import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";

import pusher from "../../../utils/pusher";

// Mock function to simulate number of bids
// Returns number of bids
const numberOfBidsMock = async (listingId) => {
    // Mock logic to check number of bids
    // Replace this with real database logic later
    const numberOfBids = 5
    return numberOfBids;
  };

//mock create api - add actual update stuff later
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { listingId } = req.body;

    try {
      // Trigger a Pusher event
      console.log('triggered create')
      pusher.trigger("bids-channel", "bid-created", {
        listingId: listingId,
      });

      res
        .status(200)
        .json({ message: "Bid created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error creatinng bid" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
