import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Carousel from "@/components/Carousel";
import { FaCircleChevronLeft } from "react-icons/fa6";
import ImageGrid from "@/components/ImageGrid";
import ModalCarousel from "@/components/ModalCarousel";
import BottomBar from "@/components/BottomBar";
import Skeleton from "@/components/Skeleton";
import { usePusher } from "@/hooks/usePusher";
import { fetchWithTimeout } from "@/utils/utils";
import { formatPrice } from "@/utils/utils";
import { format } from "date-fns";
import { GrEdit } from "react-icons/gr";
import RequestItemForHostListing from "@/components/RequestItemForHostListing";
import Tabs from "@/components/Tabs";
import {
    ACTIVE_STATUSES,
    CONFIRMED_STATUSES,
    PAST_STATUSES,
} from "@/utils/constants";

// get listing details on server side
export async function getServerSideProps(context) {
    // make sure we have an API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        // Redirect to a custom error page
        return {
            notFound: true,
        };
    }

    // get listing from DB
    const { listingId } = context.params;
    const response = await fetchWithTimeout(
        `${apiUrl}/api/listings/${listingId}`,
        {},
        5000
    );

    // error handling
    if (response.error) {
        console.error("Fetch failed: ", response.error);
        return {
            notFound: true,
        };
    }
    // Handle HTTP errors like 404 or 500
    // If an error is thrown inside getServerSideProps, it will show the pages/500.js file automatically
    // During development this file will not be used and the dev overlay will be shown instead.
    if (!response.ok) {
        if (response.status === 404) {
            return { notFound: true };
        } else {
            // Throw an error to trigger the 500 page
            throw new Error(`HTTP Error: ${response.status}`);
        }
    }

    const listing = await response.json();

    // if listing fetch was successful, fetch associated requests and user
    if (listing && listing.userId) {
        // get requests for this listing from DB
        const requestsResponse = await fetchWithTimeout(
            `${apiUrl}/api/requests/listingrequests/${listing._id}`,
            {},
            5000
        );

        // get user for this listing from DB
        const userResponse = await fetchWithTimeout(
            `${apiUrl}/api/users/${listing.userId}`,
            {},
            5000
        );

        // error handling
        if (requestsResponse.error || !requestsResponse.ok) {
            console.error(
                "Failed to fetch requests for this listing: ",
                requestsResponse.error ||
                    `HTTP Error: ${requestsResponse.status}`
            );
        } else if (userResponse.error || !userResponse.ok) {
            console.error(
                "Failed to fetch user for this listing: ",
                userResponse.error || `HTTP Error: ${userResponse.status}`
            );
        } else {
            const requests = await requestsResponse.json();
            const user = await userResponse.json();
            return { props: { listing, requests, user } };
        }
    } else {
        // if we don't have a listing object or that listing object has no userId, something's wrong
        // will trigger an error to show the 500 page
        throw new Error(
            "Something went wrong with the server side listing fetch"
        );
    }
}

const HostListing = ({ listing, requests, user }) => {
    // get listing ID from route params
    const router = useRouter();

    // get pusher context
    const pusher = usePusher();

    // Derived state or computations
    const { formattedAddress, formattedRoomInfo, images } = useMemo(() => {
        if (!listing) {
            return {
                formattedAddress: "",
                numBeds: 0,
                numBedrooms: 0,
                numBathrooms: 0,
                formattedRoomInfo: "",
                images: [],
            };
        }

        const formattedAddress = `${listing.location.address1}, ${listing.location.city}, ${listing.location.stateprovince}`;
        const numBeds = listing.basics.bedrooms.map(
            (bedroom) => bedroom.bedType
        ).length;
        const numBedrooms = listing.basics.bedrooms.length;
        const numBathrooms = listing.basics.bathrooms;
        const formattedRoomInfo = `${numBeds} bed${
            numBeds === 1 ? "" : "s"
        } • ${numBedrooms} bedroom${
            numBedrooms === 1 ? "" : "s"
        } • ${numBathrooms} bathroom${numBathrooms === 1 ? "" : "s"}`;
        const images = listing.images.map(({ url }) => url);

        return {
            formattedAddress,
            formattedRoomInfo,
            images,
        };
    }, [listing]);

    //Non computed state declarations
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showGrid, setShowGrid] = useState(false);
    const [showModalCarousel, setShowModalCarousel] = useState(false);
    const [highestRequestPrice, setHighestRequestPrice] = useState(null);
    const [numberOfRequests, setNumberOfRequests] = useState(null);
    const [requestsActiveTab, setRequestsActiveTab] = useState("active");
    const [displayRequests, setDisplayRequests] = useState([]);
    const [listingActiveTab, setListingActiveTab] = useState("");

    // already have requests from server side props, so filter into active and past requests
    const activeRequests = requests
        .filter((request) => ACTIVE_STATUSES.includes(request.status))
        .sort((p1, p2) => new Date(p2.updatedAt) - new Date(p1.updatedAt));

    const pastRequests = requests
        .filter((request) => PAST_STATUSES.includes(request.status))
        .sort((p1, p2) => new Date(p2.updatedAt) - new Date(p1.updatedAt));

    const acceptedRequest = requests.filter((request) =>
        CONFIRMED_STATUSES.includes(request.status)
    );

    // useEffect to do a few things on render
    useEffect(() => {
        // figure out whether listing is active, past or confirmed
        if (listing.published) {
            setListingActiveTab("active");
        } else if (listing.isBooked) {
            setListingActiveTab("confirmed");
        } else {
            setListingActiveTab("past");
        }

        // set numberOfRequests state
        setNumberOfRequests(activeRequests.length);

        // set highest active request price
        if (activeRequests.length > 0) {
            const activeRequestPrices = activeRequests.map(
                (req) => req.price || 0
            );
            setHighestRequestPrice(Math.max(...activeRequestPrices));
        }
    }, [listing]);

    // useEffect for pusher realtime connection to update highestRequestPrice
    useEffect(() => {
        if (pusher) {
            // Subscribe to the channel
            const channel = pusher.subscribe(listing._id);

            // Bind to bid create events
            channel.bind("request:new", (data) => {
                if (data.listingId === listing._id) {
                    setNumPendingRequests(
                        (prevNumberOfRequests) => prevNumberOfRequests + 1
                    );
                    if (data.price > highestPendingRequest) {
                        setHighestPendingRequest(data.price);
                    }
                }
            });

            // Bind to bid update events
            channel.bind("request:update", (data) => {
                if (data.listingId === listing._id) {
                    setHighestPendingRequest(data.newHighestBid);
                }
            });

            return () => {
                // Unbind all events and unsubscribe when component unmounts if subscribed
                if (channel?.subscribed) {
                    channel.unbind_all();
                    channel.unsubscribe();
                }
            };
        }
    }, [pusher]);

    // function to handle image selection from grid
    const handleImageSelect = (index) => {
        setSelectedImageIndex(index);
        setShowGrid(false);
        setShowModalCarousel(true);
    };

    // loading component for bids
    const LoadingBids = () => {
        return <Skeleton className="h-6 w-full" />;
    };

    // loading component for user
    const LoadingUser = () => {
        return <Skeleton className="h-6 w-full" />;
    };

    // useEffect to update displayListings when requestsActiveTab changes
    useEffect(() => {
        switch (requestsActiveTab) {
            case "active":
                setDisplayRequests(activeRequests);
                break;
            case "past":
                setDisplayRequests(pastRequests);
                break;
            default:
                setDisplayRequests([]);
        }
    }, [requestsActiveTab]);

    return (
        <>
            {/* Back button */}
            {!showGrid && !showModalCarousel && (
                <div
                    className="absolute top-0 left-0 w-fit z-[100] p-4"
                    onClick={router.back}
                >
                    <FaCircleChevronLeft className="text-2xl text-gray-800" />
                </div>
            )}

            {/* Edit button */}
            {listingActiveTab === "active" || listingActiveTab === "past" ? (
                <div
                    className="absolute flex items-center justify-center top-0 right-0 z-[100] m-3 rounded-full bg-color-primary w-8 h-8 hover:cursor-pointer"
                    onClick={() =>
                        router.push(`/host/manage-listings/${listing._id}/edit`)
                    }
                >
                    <GrEdit className="text-base text-gray-100" />
                </div>
            ) : null}

            {/* Main content */}
            <div
                className={
                    !showGrid && !showModalCarousel
                        ? "flex flex-col no-underline text-black overflow-hidden pb-36"
                        : "h-screen overflow-y-hidden"
                }
            >
                {/* Main image carousel */}
                <div className="w-full h-60">
                    <Carousel
                        images={images}
                        onClick={() => setShowGrid(true)}
                        index={0}
                        dots={true}
                        from={"Listing"}
                    />
                </div>

                {/* Image grid to be shown when user clicks on any image in the main carousel */}
                {showGrid && (
                    <ImageGrid
                        images={images}
                        onImageSelect={handleImageSelect}
                        onClose={() => setShowGrid(false)}
                    />
                )}

                {/* Modal carousel to be shown when user clicks on any image in the image grid */}
                {showModalCarousel && (
                    <ModalCarousel
                        images={images}
                        initialSlide={selectedImageIndex}
                        onClose={() => {
                            setShowModalCarousel(false);
                            setShowGrid(true);
                        }}
                    />
                )}

                {/* Listing info */}
                <div className="flex flex-col mx-8">
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <div className="flex justify-between">
                            <h3 className="text-2xl font-bold">
                                {listing.title}
                            </h3>
                            <p>{listing.days_left}</p>
                        </div>
                        <address className="text-lg">
                            {formattedAddress}
                        </address>

                        {/* Dynamically load bid information */}
                        <div className="flex justify-between mt-2 text-lg">
                            <p>
                                Listed for:{" "}
                                <span className="font-semibold">
                                    {formatPrice(listing.price, false)}
                                </span>
                            </p>
                            {listingActiveTab === "confirmed" ? (
                                // If the listing is booked, just say booked
                                <p>Listing is booked</p>
                            ) : activeRequests.length > 0 ? (
                                // Active requests exist
                                <p>
                                    {activeRequests.length} active bid
                                    {activeRequests.length === 1 ? "" : "s"}
                                </p>
                            ) : pastRequests.length > 0 ? (
                                // No active requests, but past requests exist
                                <p>No active bid.</p>
                            ) : (
                                // No requests at all
                                <p>No bids have been placed</p>
                            )}
                        </div>
                    </div>
                    {/* Dynamically load username */}
                    <div className="py-4 border-b-[0.1rem] border-gray-300 text-xl">
                        <div className="flex flex-wrap items-center gap-1">
                            <div className="min-w-0">
                                Entire suite subletted by
                            </div>
                            <span className="font-bold flex-grow flex-shrink">
                                {!user ? <LoadingUser /> : user?.firstName}
                            </span>
                        </div>
                        <div className="mt-2">
                            <p>{formattedRoomInfo}</p>
                        </div>
                    </div>

                    {/* Booking for this listing */}
                    {listingActiveTab === "confirmed" &&
                        acceptedRequest.length > 0 && (
                            <>
                                <h3 className="text-2xl font-bold mb-4 mt-2">
                                    Confirmed Booking:
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {acceptedRequest.map((request) => {
                                        return (
                                            // created separate component for this so each one can
                                            // fetch its own user info for the request
                                            <RequestItemForHostListing
                                                key={request._id}
                                                request={request}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        )}

                    {/* List of requests for this listing */}
                    <h3 className="text-2xl font-bold mb-4 mt-2">Requests:</h3>
                    <Tabs
                        tabList={["active", "past"]}
                        setActiveTab={setRequestsActiveTab}
                        defaultTab={"active"}
                    />
                    <div className="flex flex-col gap-2">
                        {displayRequests.length > 0 ? (
                            displayRequests.map((request) => {
                                return (
                                    // created separate component for this so each one can
                                    // fetch its own user info for the request
                                    <RequestItemForHostListing
                                        key={request._id}
                                        request={request}
                                    />
                                );
                            })
                        ) : (
                            <div className="h-28" />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HostListing;
