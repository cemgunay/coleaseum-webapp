import connectMongo from "@/utils/connectMongo";
import Request from "@/models/Request";

import pusher from '../../../utils/pusher';

// Mock function to simulate updating a bid in the database
// Returns true if the new bid is the highest bid
const updateBidMock = async (listingId, bidAmount) => {
  // Mock logic to check if the new bid is higher than the current highest bid
  // Replace this with real database logic later
  const currentHighestBid = 500; // Mock current highest bid
  return bidAmount > currentHighestBid;
};

//mock update api - add actual update stuff later
export default async function handler(req, res) {
  if (req.method === 'POST') {

    const { listingId, bidAmount } = req.body;

    try {
      const isHighestBid = await updateBidMock(listingId, bidAmount);

      if (isHighestBid) {
        // Trigger a Pusher event
        pusher.trigger('bids-channel', 'bid-updated', {
          listingId: listingId,
          newHighestBid: bidAmount
        });
      }

      res.status(200).json({ message: 'Bid updated successfully', isHighestBid });
    } catch (error) {
      res.status(500).json({ message: 'Error updating bid' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
