import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Carousel from "./Carousel";
import Skeleton from "./Skeleton";

const ListingItem = ({ listing }) => {
    const images = listing.images.map(({ url }) => url);
    const [requests, setRequests] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
    const [highestRequestPrice, setHighestRequestPrice] = useState(null);
    const [highestActiveRequestPrice, setHighestActiveRequestPrice] = useState(null);
    const [loading, setLoading] = useState(true);

    // get all requests and all active requests
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
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
                const activeRequestPrices = activeRequestsData.map((req) => req.price || 0);

                // update state (no need to set to null if length is 0 since they start out as null)
                if (requestPrices.length) {
                    setHighestRequestPrice(Math.max(...requestPrices));
                }

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

    // // filter tenant and subtenant requests from requests array
    // // using memoization here to ensure this filtering only happens if requests array changes
    // const tenantReqests = useMemo(() => {
    //     return requests.filter(
    //         (req) => req.status !== "rejected" && req.status !== "pendingSubTenant"
    //     );
    // }, [requests]);

    // const subtenantRequests = useMemo(() => {
    //     return requests.filter((req) => req.status === "pendingSubTenant");
    // }, [requests]);

    return (
        <div className="relative">
            <Link href={`/listing/${listing._id}`} className="max-w-lg">
                <div className="w-full h-[13rem] rounded-md">
                    <Carousel dots={true} images={images} index={0} from={"Explore"} rounded />
                </div>
                <div className="flex flex-col text-black">
                    <div className="flex justify-between">
                        <h3 className="font-medium">{listing.title}</h3>
                        {/* <p>{listing.days_left}</p> */}
                    </div>
                    <address>{formattedAddress}</address>
                    <p>{listing.dates}</p>
                    <div className="flex justify-between">
                        {loading ? (
                            <Skeleton className="h-5 w-32 mt-1" />
                        ) : (
                            <h3 className="font-medium">
                                {highestActiveRequestPrice
                                    ? `${highestActiveRequestPrice} Highest Offer`
                                    : `${listing.price} List Price`}
                            </h3>
                        )}
                        {loading ? (
                            <Skeleton className="h-5 w-24 mt-1" />
                        ) : (
                            <p>
                                {activeRequests.length
                                    ? `${activeRequests.length} active bid${
                                          activeRequests.length === 1 ? "" : "s"
                                      }`
                                    : `No active bids`}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ListingItem;
