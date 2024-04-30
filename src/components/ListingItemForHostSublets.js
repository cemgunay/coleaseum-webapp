import React from "react";
import Link from "next/link";
import Carousel from "./Carousel";
import { ACTIVE_STATUSES, CONFIRMED_STATUSES, PAST_STATUSES } from "@/utils/constants";

// exact same as ListingItem, except Links to request page instead of listing page,
// and the offer information is displayed slightly differently
const ListingItemForHostSublets = ({ listing, requests, activeTab, showActiveBids = true }) => {
    const images = listing.images.map(({ url }) => url);

    // already have requests passed as a prop, so filter to get active ones
    const activeRequests = requests.filter((request) => request.status !== "rejected");

    // get highest active request price (set to null if no active requests)
    let highestActiveRequestPrice = null;
    if (activeRequests.length) {
        const activeRequestPrices = activeRequests.map((req) => req.price || 0);
        highestActiveRequestPrice = Math.max(...activeRequestPrices);
    }

    // format address string from location info
    const { address1, city, stateprovince } = listing.location;
    const formattedAddress = `${address1}, ${city}, ${stateprovince}`;

    // function to render price text depending on active tab and price info
    // rendering full <p> tags here so I can conditionally add text and styling in one function
    const renderPriceText = () => {
        switch (activeTab) {
            case "past":
                // For the "past" tab, we're showing nothing
                return null;
            case "active":
                const activeRequests = requests.filter(request => 
                    ACTIVE_STATUSES.includes(request.status));
                const highestActiveRequestPrice = activeRequests.reduce((max, request) => 
                    request.price > max ? request.price : max, 0);
    
                if (activeRequests.length === 0 || activeRequests.every(request => PAST_STATUSES.includes(request.status))) {
                    // No active offers or all offers are rejected
                    return <h3 className="font-medium text-color-warning">No Offers</h3>;
                } else if (highestActiveRequestPrice) {
                    // There are active offers; show the highest offer
                    return (
                        <h3 className="font-medium text-color-pass">
                            Highest Offer: {highestActiveRequestPrice}
                        </h3>
                    );
                }
                break;
            case "confirmed":
                const confirmedRequest = requests.find(request => 
                    CONFIRMED_STATUSES.includes(request.status));
                if (confirmedRequest) {
                    // There is a confirmed request; show its price
                    return (
                        <h3 className="font-medium text-color-pass">
                            Confirmed Offer: {confirmedRequest.price}
                        </h3>
                    );
                } else {
                    // Logically, if we're on the "confirmed" tab but find no confirmed request, something might be off
                    return <h3 className="font-medium text-color-warning">No Confirmed Offers</h3>;
                }
        }
    };
    

    return (
        <div className="relative">
            <Link href={`/host/listing/${listing?._id}`} className="max-w-lg">
                <div className="w-full h-[13rem] rounded-md">
                    <Carousel dots={true} images={images} index={0} rounded />
                </div>
                <div className="flex flex-col text-black gap-0.5">
                    <div className="flex justify-between mt-2">
                        <h3 className="font-medium">{listing.title}</h3>
                        {listing.views >= 0 ? (
                            <p className="rounded-sm px-2 bg-slate-200 text-slate-600 text-sm pt-[0.1rem] mr-1">
                                {listing.views} view{listing.views === 1 ? "" : "s"}
                            </p>
                        ) : null}
                    </div>
                    <address>{formattedAddress}</address>
                    <p>{listing.dates}</p>
                    <div className="flex justify-between">
                        {renderPriceText()}
                        {showActiveBids ? (
                            <p>
                                {activeRequests.length
                                    ? `${activeRequests.length} active bid${
                                          activeRequests.length === 1 ? "" : "s"
                                      }`
                                    : `No active bids`}
                            </p>
                        ) : null}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ListingItemForHostSublets;
