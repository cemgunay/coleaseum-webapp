import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Carousel from "./Carousel";

const ListingItemPreview = ({ listing }) => {
    const images = listing.images.map(({ cloudinaryUrl }) => cloudinaryUrl);
    const [requests, setRequests] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
    const [highestRequestPrice, setHighestRequestPrice] = useState(null);
    const [highestActiveRequestPrice, setHighestActiveRequestPrice] =
        useState(null);

    // get all requests and all active requests
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // fetch all requests for the current listing
                const requestsResponse = await fetch(
                    `/api/requests/listingrequests/${listing._id}`
                );
                if (!requestsResponse.ok) {
                    throw new Error("Failed to fetch requests :(");
                }
                const requestsData = await requestsResponse.json();
                setRequests(requestsData);

                // fetch all active requests for the current listing
                const activeRequestsResponse = await fetch(
                    `/api/requests/listingactiverequests/${listing._id}`
                );
                if (!activeRequestsResponse.ok) {
                    throw new Error("Failed to fetch active requests :(");
                }
                const activeRequestsData = await activeRequestsResponse.json();
                setActiveRequests(activeRequestsData);

                // process data to find highest prices
                // create arrays of prices from each request, defaulting to zero if no price found
                // NB: defaulting to 0 instead of -Infinity bc we shouldn't have any negative prices
                const requestPrices = requestsData.map((req) => req.price || 0);
                const activeRequestPrices = activeRequestsData.map(
                    (req) => req.price || 0
                );

                // update state (no need to set to null if length is 0 since they start out as null)
                if (requestPrices.length) {
                    setHighestRequestPrice(Math.max(...requestPrices));
                }

                if (activeRequestPrices.length) {
                    setHighestActiveRequestPrice(
                        Math.max(...activeRequestPrices)
                    );
                }
            } catch (error) {
                console.error("Failed overall: \n", error);
                throw new Error("Failed overall :(");
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

    // filter tenant and subtenant requests from requests array
    // using memoization here to ensure this filtering only happens if requests array changes
    const tenantReqests = useMemo(() => {
        return requests.filter(
            (req) =>
                req.status !== "rejected" && req.status !== "pendingSubTenant"
        );
    }, [requests]);

    const subtenantRequests = useMemo(() => {
        return requests.filter((req) => req.status === "pendingSubTenant");
    }, [requests]);

    return (
        <Link href={`/host/create-listing/${listing._id}/preview`} className="max-w-lg">
            <div className="relative w-full h-[13rem] rounded-md">
                <Carousel
                    dots={true}
                    images={images}
                    index={0}
                    from={"Explore"}
                    rounded
                />
                <div className="absolute top-0 left-0 bg-white text-black rounded-sm p-1 text-xs m-2">
                        Show Preview
                    </div>
            </div>
            <div className="flex flex-col text-black">
                <div className="flex justify-between">
                    <h3 className="font-medium">{listing.title}</h3>
                    {/* <p>{listing.days_left}</p> */}
                </div>
                <address>{formattedAddress}</address>
                <p>{listing.dates}</p>
                <div className="flex justify-between">
                    <h3 className="font-medium">
                        {highestActiveRequestPrice
                            ? `${highestActiveRequestPrice} Highest Offer`
                            : `${listing.price} List Price`}
                    </h3>
                    <p>
                        {/* NB: The calculation for active bids here is different to the one on individual listing page  */}
                        {tenantReqests.length
                            ? `${tenantReqests.length} active bid${
                                  tenantReqests.length === 1 ? "" : "s"
                              }`
                            : `No active bids`}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default ListingItemPreview;
// TODO:
// - highest active request price calculation
// - tenant requests stuff (i.e. check for active bids, hardcoded to "no active bids" for now)
