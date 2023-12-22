import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Carousel from "@/components/Carousel";
import { FaCircleChevronLeft } from "react-icons/fa6";
import ImageGrid from "@/components/ImageGrid";
import ModalCarousel from "@/components/ModalCarousel";
import BottomBar from "@/components/BottomBar";
import Skeleton from "@/components/Skeleton";
import { usePusher } from "@/context/PusherContext";
import { fetchWithTimeout } from "@/utils/utils";
import { formatPrice } from "@/utils/utils";
import { format } from "date-fns";
import { GrEdit } from "react-icons/gr";
import RequestItemForHostListing from "@/components/RequestItemForHostListing";
import Tabs from "@/components/Tabs";
import { ACTIVE_STATUSES, PAST_STATUSES } from "@/utils/constants";

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
    const response = await fetchWithTimeout(`${apiUrl}/api/listings/${listingId}`, {}, 5000);

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
                requestsResponse.error || `HTTP Error: ${requestsResponse.status}`
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
        throw new Error("Something went wrong with the server side listing fetch");
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
        const numBeds = listing.basics.bedrooms.map((bedroom) => bedroom.bedType).length;
        const numBedrooms = listing.basics.bedrooms.length;
        const numBathrooms = listing.basics.bathrooms;
        const formattedRoomInfo = `${numBeds} bed${
            numBeds === 1 ? "" : "s"
        } • ${numBedrooms} bedroom${numBedrooms === 1 ? "" : "s"} • ${numBathrooms} bathroom${
            numBathrooms === 1 ? "" : "s"
        }`;
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
    const [highestRequest, setHighestRequest] = useState(null);
    const [numberOfRequests, setNumberOfRequests] = useState(null);
    const [activeTab, setActiveTab] = useState("active");
    const [displayRequests, setDisplayRequests] = useState([]);

    // useEffect to fetch and update active request info on client side
    useEffect(() => {
        // fetch active requests for listing
        const fetchActiveRequests = async () => {
            const response = await fetch(`/api/requests/listingactiverequests/${listing._id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch active requests :(");
            }
            const activeRequests = await response.json();
            const activeRequestPrices = activeRequests.map((req) => req.price || 0);
            setHighestRequest(Math.max(...activeRequestPrices));
            setNumberOfRequests(activeRequests.length);
        };

        fetchActiveRequests();
    }, [listing]);

    // useEffect for pusher realtime connection to update highestRequest
    useEffect(() => {
        if (pusher) {
            // Subscribe to the channel
            const channel = pusher.subscribe("bids-channel");

            // Bind to bid update events
            channel.bind("bid-updated", (data) => {
                if (data.listingId === listing._id) {
                    setHighestRequest(data.newHighestBid);
                }
            });

            // Bind to bid create events
            channel.bind("bid-created", (data) => {
                if (data.listingId === listing._id) {
                    setNumberOfRequests((prevNumberOfRequests) => prevNumberOfRequests + 1);
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

    // filtering into active and past requests
    const activeRequests = useMemo(() => {
        return requests
            .filter((request) => ACTIVE_STATUSES.includes(request.status))
            .sort((p1, p2) => new Date(p2.updatedAt) - new Date(p1.updatedAt));
    }, [requests]);
    const pastRequests = useMemo(() => {
        return requests
            .filter((request) => PAST_STATUSES.includes(request.status))
            .sort((p1, p2) => new Date(p2.updatedAt) - new Date(p1.updatedAt));
    }, [requests]);

    // useEffect to update displayListings when activeTab changes
    useEffect(() => {
        switch (activeTab) {
            case "active":
                setDisplayRequests(activeRequests);
                break;
            case "past":
                setDisplayRequests(pastRequests);
                break;
            default:
                setDisplayRequests([]);
        }
    }, [activeTab]);

    return (
        <>
            {/* Back button */}
            {!showGrid && !showModalCarousel && (
                <div className="absolute top-0 left-0 w-fit z-[100] p-4" onClick={router.back}>
                    <FaCircleChevronLeft className="text-2xl text-gray-800" />
                </div>
            )}

            {/* Edit button */}
            <div
                className="absolute flex items-center justify-center top-0 right-0 z-[100] m-2 rounded-full bg-color-primary w-8 h-8 hover:cursor-pointer"
                onClick={() => router.push(`host/manage/listings/${listing._id}/edit`)}
            >
                <GrEdit className="text-base text-gray-100" />
            </div>

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
                            <h3 className="text-2xl font-bold">{listing.title}</h3>
                            <p>{listing.days_left}</p>
                        </div>
                        <address className="text-lg">{formattedAddress}</address>
                        {/* Dynamically load bid information */}
                        <div className="flex justify-between mt-2 text-lg">
                            {!highestRequest ? (
                                <LoadingBids />
                            ) : (
                                <>
                                    <p>
                                        Listed for:{" "}
                                        <span className="font-semibold">
                                            {formatPrice(listing.price, false)}
                                        </span>
                                    </p>
                                    <p>
                                        {numberOfRequests} active bid
                                        {numberOfRequests === 1 ? "" : "s"}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Dynamically load username */}
                    <div className="py-4 border-b-[0.1rem] border-gray-300 text-xl">
                        <div className="flex flex-wrap items-center gap-1">
                            <div className="min-w-0">Entire suite subletted by</div>
                            <span className="font-bold flex-grow flex-shrink">
                                {!user ? <LoadingUser /> : user?.firstName}
                            </span>
                        </div>
                        <div className="mt-2">
                            <p>{formattedRoomInfo}</p>
                        </div>
                    </div>

                    {/* List of requests for this listing */}
                    <h3 className="text-2xl font-bold mb-4 mt-2">Requests:</h3>
                    <Tabs
                        tabList={["active", "past"]}
                        setActiveTab={setActiveTab}
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
                <BottomBar />
            </div>
        </>
    );
};

export default HostListing;
