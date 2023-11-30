import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Carousel from "./Carousel";
import Skeleton from "./Skeleton";
import { cn } from "@/utils/utils";

// exact same as ListingItem, except Links to request page instead of listing page,
// and the offer information is displayed slightly differently
const ListingItemForSublets = ({ listing, request, activeTab, showActiveBids = true }) => {
    const images = listing.images.map(({ url }) => url);
    const [activeRequests, setActiveRequests] = useState([]);
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

    // function to generate tailwind classes for price display depending on active tab
    const priceClass = (activeTab) => {
        return cn(
            "font-medium",
            activeTab === "past" && "text-color-error",
            activeTab === "active" && "text-color-warning",
            activeTab === "confirmed" && "text-color-pass"
        );
    };

    let priceText = "";
    switch (activeTab) {
        case "past":
            priceText = "Rejected Offer(s)";
            break;
        case "active":
            priceText = `Your Offer: ${request?.price}`;
            break;
        case "confirmed":
            priceText = `Accepted Offer: ${request?.price}`;
            break;
    }

    return (
        <div className="relative">
            <Link href={`/request/${request?._id}`} className="max-w-lg">
                <div className="w-full h-[13rem] rounded-md">
                    <Carousel dots={true} images={images} index={0} rounded />
                </div>
                <div className="flex flex-col text-black">
                    <div className="flex justify-between">
                        <h3 className="font-medium">{listing.title}</h3>
                    </div>
                    <address>{formattedAddress}</address>
                    <p>{listing.dates}</p>
                    <div className="flex justify-between">
                        {loading ? (
                            <Skeleton className="h-5 w-32 mt-1" />
                        ) : (
                            <h3 className={priceClass(activeTab)}>{priceText}</h3>
                        )}
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

export default ListingItemForSublets;
