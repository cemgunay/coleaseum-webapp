import connectMongo from "@/utils/connectMongo";
import Listing from "@/models/Listing";
import Booking from "@/models/Booking";

export default async function handler(req, res) {
    try {
        // attempt DB connection
        await connectMongo();

        // only allowing GET requests (for now, not sure if this endpoint needs PUTs or POSTs too)
        if (req.method == "GET") {
            // create query that will be edited by filters
            const dbQuery = { published: true };

            // extract query filters from request
            const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

            // populate dbQuery based on received query and filters
            if (req.query.city) {
                dbQuery.city = req.query.city;
            }
            if (req.query.moveInDate) {
                dbQuery.moveInDate = {
                    $gte: req.query.moveInDate[0],
                    $lte: req.query.moveInDate[1],
                };
            }
            if (req.query.moveOutDate) {
                dbQuery.moveOutDate = {
                    $gte: req.query.moveOutDate[0],
                    $lte: req.query.moveOutDate[1],
                };
            }
            if (req.query.expiryDate) {
                dbQuery.expiryDate = {
                    $gte: req.query.expiryDate[0],
                    $lte: req.query.expiryDate[1],
                };
            }
            if (filters.price) {
                dbQuery.price = { $gte: filters.price[0], $lte: filters.price[1] };
            }
            if (filters.propertyType) {
                dbQuery["aboutyourplace.propertyType"] = filters.propertyType;
            }
            if (req.query.numOfBedrooms) {
                dbQuery["bedrooms.length"] = {
                    $gte: req.query.numOfBedrooms[0],
                    $lte: req.query.numOfBedrooms[1],
                };
            }
            if (req.query.utilities) {
                const { hydro, electricity, water, wifi } = req.query.utilities;
                if (hydro) {
                    dbQuery["utilities.hydro"] = hydro;
                }
                if (electricity) {
                    dbQuery["utilities.electricity"] = electricity;
                }
                if (water) {
                    dbQuery["utilities.water"] = water;
                }
                if (wifi) {
                    dbQuery["utilities.wifi"] = wifi;
                }
            }

            if (filters.startDate && filters.endDate) {
                // Parse dates to only consider the year and month, ignoring specific days
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

                try {
                    const listings = await Listing.find(dbQuery).exec();

                    // Fetch all bookings that overlap with the desired date range
                    const bookings = await Booking.find({
                        $or: [
                            // Booking starts during the desired range
                            { startDate: { $lt: endMonth } },
                            // Booking ends during the desired range
                            { endDate: { $gte: startMonth } },
                        ],
                    });

                    // Convert bookings to a Set for faster lookups
                    const bookingSet = new Set(
                        bookings.map((booking) => booking.listingId.toString())
                    );

                    // Filter out listings that are already booked for the desired date range
                    const availableListings = listings.filter(
                        (listing) => !bookingSet.has(listing._id.toString())
                    );

                    res.status(200).json(availableListings);
                } catch (error) {
                    res.status(500).json({ message: "Internal Server Error" });
                }
            } else {
                try {
                    const listings = await Listing.find(dbQuery).exec();
                    res.status(200).json(listings);
                } catch (error) {
                    res.status(500).json({ message: "Internal Server Error" });
                }
            }
        } else {
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        // handle connection errors
        console.error("Failed to connect to the DB", error);
        res.status(500).join({ error: "Internal Server Error" });
    }
}
