import React, { useMemo } from "react";
import Link from "next/link";
import Carousel from "./Carousel";

// exact same as ListingItem, except Links to request page instead of listing page,
// and the offer information is displayed slightly differently
const ListingItemForHostSublets = ({ listing, requests, activeTab, showActiveBids = true }) => {
    const images = listing.images.map(({ url }) => url);

    // already have requests passed as a prop, so filter to get active ones
    const activeRequests = useMemo(() => {
        return requests.filter((request) => request.status !== "rejected");
    }, [requests]);

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
                // showing nothing for past tab
                return null;
            case "active":
                if (requests.every((request) => request.status === "rejected")) {
                    // there are offers, but they're all rejected
                    return <h3 className="font-medium text-color-warning">No Offers</h3>;
                } else if (highestActiveRequestPrice) {
                    // there are un-rejected offers, show highest offer
                    return (
                        <h3 className="font-medium text-color-pass">
                            Highest Offer: {highestActiveRequestPrice}
                        </h3>
                    );
                } else {
                    // no offers placed yet
                    return <h3 className="font-medium text-color-warning">No Offers</h3>;
                }
            case "confirmed":
                const confirmedRequest = requests.find((request) => request.status === "confirmed");
                if (confirmedRequest) {
                    // there is a confirmed request, show its price
                    return (
                        <h3 className="font-medium text-color-pass">
                            Confirmed Offer: {confirmedRequest.price}
                        </h3>
                    );
                } else {
                    // should reaching here be possible for confirmed tab?
                    // my thinking says no, but this scenario is still happening in practice
                    // maybe I'm misunderstanding all this logic somehow, but I made the changes exactly as suggested!
                    // active listings are published = true, past listings are expired, confirmed listings are isBooked = true
                    // I feel like we'll be able to streamline all of this once we sort out the request logic fully
                    return <h3 className="font-medium text-color-warning">No Offers</h3>;
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
