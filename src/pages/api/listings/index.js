import connectMongo from "@/utils/connectMongo";
import Listing from "@/models/Listing";
import Booking from "@/models/Booking";
import authenticate from "@/utils/authentication";

// helper function to build the DB query from request query and filters
const buildDBQuery = (reqQuery, filters) => {
    // create dbQuery to be edited by req query and filters
    const dbQuery = { published: true };

    // populate dbQuery object based on request query and filters
    if (reqQuery.city) dbQuery.city = reqQuery.city;
    if (reqQuery.moveInDate) {
        dbQuery.moveInDate = {
            $gte: reqQuery.moveInDate[0],
            $lte: reqQuery.moveInDate[1],
        };
    }
    if (reqQuery.moveOutDate) {
        dbQuery.moveOutDate = {
            $gte: reqQuery.moveOutDate[0],
            $lte: reqQuery.moveOutDate[1],
        };
    }
    if (reqQuery.expiryDate) {
        dbQuery.expiryDate = {
            $gte: reqQuery.expiryDate[0],
            $lte: reqQuery.expiryDate[1],
        };
    }
    if (filters.price) {
        dbQuery.price = { $gte: filters.price[0], $lte: filters.price[1] };
    }
    if (filters.propertyType) {
        dbQuery["aboutyourplace.propertyType"] = filters.propertyType;
    }
    if (reqQuery.numOfBedrooms) {
        dbQuery["bedrooms.length"] = {
            $gte: reqQuery.numOfBedrooms[0],
            $lte: reqQuery.numOfBedrooms[1],
        };
    }
    if (reqQuery.utilities) {
        const { hydro, electricity, water, wifi } = reqQuery.utilities;
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

    return dbQuery;
};

// helper function to parse dates (to only consider month and year, ignoring specific days)
const parseDates = (filters) => {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    return {
        startMonth: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
        endMonth: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
    };
};

export default async function handler(req, res) {
    try {
        // attempt DB connection
        await connectMongo();

        // GET, POST, and PUT requests
        if (req.method == "GET") {
            // extract query filters from request
            const filters = req.query.filters
                ? JSON.parse(req.query.filters)
                : {};

            // build db query with helper
            const dbQuery = buildDBQuery(req.query, filters);

            if (filters.startDate && filters.endDate) {
                // parse dates to ignore specific days, only consider month and year
                const { startMonth, endMonth } = parseDates(filters);

                // query the DB, filtering out listings already booked for desired date range
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

                    // ***** may be changed in future *****
                    // instead of checking if booking dates overlap, just have an isBooked for the listigns
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
                    console.log("got error with filtering: ", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
            } else {
                // query DB
                try {
                    const listings = await Listing.find(dbQuery).exec();
                    res.status(200).json(listings);
                } catch (error) {
                    console.log("got error without filtering: ", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
            }
        } else if (req.method === "POST") {
            // Handle POST request for creating a new listing
            try {
                const newListing = new Listing(req.body);

                const savedListing = await newListing.save();
                res.status(201).json({ success: true, id: savedListing._id });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        } else if (req.method === "PUT") {
            // Authenticate the user
            const token = await authenticate(req, res);

            if (!token) {
                // Authentication failed, response has been sent by authenticate
                return;
            }

            // Extract the listing ID and data to update
            const { listingId, updateData } = req.body;

            if (!listingId || !updateData) {
                return res
                    .status(400)
                    .json({ error: "Listing ID and update data are required" });
            }

            try {
                const listing = await Listing.findById(listingId);

                if (!listing) {
                    return res.status(404).json({ error: "Listing not found" });
                }

                // Check if the logged-in user is the owner of the listing
                if (listing.userId !== token.id) {
                    return res.status(403).json({
                        error: "You are not authorized to update this listing",
                    });
                }

                // Update the listing in the database
                const updatedListing = await Listing.findByIdAndUpdate(
                    listingId,
                    updateData,
                    { new: true }
                );

                if (!updatedListing) {
                    return res.status(404).json({ error: "Listing not found" });
                }

                res.status(200).json({ success: true, updatedListing });
            } catch (error) {
                console.error("Update error: ", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        } else {
            // Handle unsupported methods
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        // handle connection errors
        console.error("Failed to connect to the DB", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
