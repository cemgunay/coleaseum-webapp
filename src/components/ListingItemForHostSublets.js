import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Carousel from "./Carousel";
import Skeleton from "./Skeleton";
import { cn } from "@/utils/utils";
import { de } from "date-fns/locale";

// exact same as ListingItem, except Links to request page instead of listing page,
// and the offer information is displayed slightly differently
const ListingItemForHostSublets = ({ listing, activeTab, showActiveBids = true }) => {
    const images = listing.images.map(({ url }) => url);
    const [activeRequests, setActiveRequests] = useState([]);
    const [highestActiveRequestPrice, setHighestActiveRequestPrice] = useState(null);
    const [loading, setLoading] = useState(true);

    // get all requests and all active requests
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                // fetch all active requests for the current listing
                const activeRequestsResponse = await fetch(
                    `/api/requests/listingactiverequests/${listing._id}`
                );
                if (!activeRequestsResponse.ok) {
                    throw new Error("Failed to fetch active requests :(");
                }
                const activeRequestsData = await activeRequestsResponse.json();
                setActiveRequests(activeRequestsData);

                // process data to find highest active request price
                // create arrays of prices from each active request, defaulting to zero if no price found
                // NB: defaulting to 0 instead of -Infinity bc we shouldn't have any negative prices
                const activeRequestPrices = activeRequestsData.map((req) => req.price || 0);

                // update state
                // (no need to set to null if length is 0 since highestActiveRequestPrice start out as null)
                if (activeRequestPrices.length) {
                    setHighestActiveRequestPrice(Math.max(...activeRequestPrices));
                }
            } catch (error) {
                console.error("Failed overall: \n", error);
                throw new Error("Failed overall :(");
            } finally {
                setLoading(false);
            }
        };

        // if we have a listing, fetch the relevant requests
        if (listing && listing._id) {
            fetchRequests();
        }
    }, [listing._id]);

    // format address string from location info
    const { address1, city, stateprovince } = listing.location;
    const formattedAddress = `${address1}, ${city}, ${stateprovince}`;

    // // function to generate tailwind classes for price display depending on active tab
    // const priceClass = (activeTab) => {
    //     return cn(
    //         "font-medium",
    //         activeTab === "past" && "text-color-error",
    //         activeTab === "active" && "text-color-warning",
    //         activeTab === "confirmed" && "text-color-pass"
    //     );
    // };

    // let priceText = "";
    // switch (activeTab) {
    //     case "past":
    //         priceText = "Rejected Offer(s)";
    //         break;
    //     case "active":
    //         priceText = `Your Offer: ${request?.price}`;
    //         break;
    //     case "confirmed":
    //         priceText = `Accepted Offer: ${request?.price}`;
    //         break;
    // }

    // function to render price text depending on active tab and price info
    // rendering full <p> tags here so I can conditionally add text and styling in one function
    const renderPriceText = () => {
        switch (activeTab) {
            // case "past":
            case "active":
                if (listing.requests.every((request) => request.status === "rejected")) {
                    return <h3 className="font-medium text-color-warning">No Offers</h3>;
                } else if (highestActiveRequestPrice) {
                    return (
                        <h3 className="font-medium text-color-pass">
                            Highest Offer: {highestActiveRequestPrice}
                        </h3>
                    );
                } else {
                    // should never get here, but just in case
                    return <h3 className="font-medium text-color-error">SOMETHING'S WRONG</h3>;
                }
            // case "confirmed":
            default:
                // putting a default here until i know exactly how to handle past and confirmed listings
                return (
                    <h3 className="font-medium text-color-warning">
                        {highestActiveRequestPrice
                            ? `Price: ${highestActiveRequestPrice}`
                            : "No Offers"}
                    </h3>
                );
        }
    };

    return (
        <div className="relative">
            {/* will link to /host/listing/[listingId] in future when that page is made */}
            {/* linking to regular listing page for now */}
            <Link href={`/listing/${listing?._id}`} className="max-w-lg">
                <div className="w-full h-[13rem] rounded-md">
                    <Carousel dots={true} images={images} index={0} rounded />
                </div>
                <div className="flex flex-col text-black gap-0.5">
                    <div className="flex justify-between mt-2">
                        <h3 className="font-medium">{listing.title}</h3>
                        {listing.views >= 0 ? (
                            <p className="rounded-sm px-2 bg-slate-200 text-slate-600 text-sm pt-[0.1rem]">
                                {listing.views} views
                            </p>
                        ) : null}
                    </div>
                    <address>{formattedAddress}</address>
                    <p>{listing.dates}</p>
                    <div className="flex justify-between">
                        {loading ? <Skeleton className="h-5 w-32 mt-1" /> : renderPriceText()}
                        {showActiveBids ? (
                            loading ? (
                                <Skeleton className="h-5 w-24 mt-1" />
                            ) : (
                                <p>
                                    {activeRequests.length
                                        ? `${activeRequests.length} active bid${
                                              activeRequests.length === 1 ? "" : "s"
                                          }`
                                        : `No active bids`}
                                </p>
                            )
                        ) : null}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ListingItemForHostSublets;
