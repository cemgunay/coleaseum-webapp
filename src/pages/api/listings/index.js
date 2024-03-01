import connectMongo from "@/utils/connectMongo";
import Listing from "@/models/Listing";
import Booking from "@/models/Booking";
import authenticate from "@/utils/authentication";
import { DEFAULT_FILTERS } from "@/utils/constants";

// helper function to build the DB query from request query and filters
const buildDBQuery = (filters) => {
    let pipeline = [];

    // Handle spatial query first if coords are provided
    if (filters.coords) {
        pipeline.push({
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [
                        parseFloat(filters.coords.lng),
                        parseFloat(filters.coords.lat),
                    ],
                },
                distanceField: "distance", // This field will contain the calculated distance
                maxDistance: filters.radius ? filters.radius * 1000 : 10000,
                spherical: true,
            },
        });
    }

    let matchStage = { $match: { published: true, isBooked: false } };

    // Price filter
    if (filters.priceMin !== null && filters.priceMax !== null) {
        const priceMin = Number(filters.priceMin);
        const priceMax = Number(filters.priceMax);
        if (!isNaN(priceMin) && !isNaN(priceMax) && priceMin <= priceMax) {
            matchStage.$match.price = { $gte: priceMin, $lte: priceMax };
        }
    }
    //Privacy Type filter
    if (filters.privacyType && filters.privacyType !== "any") {
        matchStage.$match["aboutyourplace.privacyType"] = filters.privacyType;
    }
    // Bathroom filter
    if (filters.bathrooms && filters.bathrooms !== "any") {
        matchStage.$match["basics.bathrooms"] = {
            $gte: parseInt(filters.bathrooms, 10),
        };
    }

    if (filters.startDate) {
        // Convert startDate string to a JavaScript Date object
        const start = new Date(filters.startDate);

        matchStage.$match["moveInDate"] = {
            $gte: start,
        };
    }

    if (filters.endDate) {
        // Convert endDate string to a JavaScript Date object
        const end = new Date(filters.endDate);

        matchStage.$match["moveOutDate"] = {
            $lte: end,
        };
    }

    // Add the match stage to the pipeline
    pipeline.push(matchStage);

    // Add a stage to include the length of the bedrooms array if needed
    if (filters.bedrooms && filters.bedrooms !== "any") {
        pipeline.push({
            $addFields: {
                bedroomsCount: { $size: "$basics.bedrooms" },
            },
        });

        // Filter based on the calculated bedroomsCount
        pipeline.push({
            $match: {
                bedroomsCount: { $gte: parseInt(filters.bedrooms, 10) },
            },
        });
    }

    console.log("PIPELINE", pipeline);

    return pipeline;
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
            // Parse other filters from the query or use an empty object if none are provided
            const filtersFromQuery = req.query.filters
                ? JSON.parse(req.query.filters)
                : {};

            console.log("QUERY", filtersFromQuery);
            console.log("DEFAULT", DEFAULT_FILTERS);

            // Merge provided filters with defaults, preferring provided values over defaults
            const effectiveFilters = {
                ...DEFAULT_FILTERS,
                ...filtersFromQuery,
            };

            console.log("EFFECTIVE", effectiveFilters);

            const pipeline = buildDBQuery(effectiveFilters);

            if (effectiveFilters.startDate && effectiveFilters.endDate) {
                // parse dates to ignore specific days, only consider month and year
                const { startMonth, endMonth } = parseDates(effectiveFilters);

                // query the DB, filtering out listings already booked for desired date range
                try {
                    // Use aggregate instead of find
                    const listings = await Listing.aggregate(pipeline).exec();

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
                    // instead of checking if booking dates overlap, just have an isBooked for the listigns (currently doing that in buildDbQuery)
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
                    const listings = await Listing.aggregate(pipeline).exec();
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
