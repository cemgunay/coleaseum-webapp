import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import Carousel from "@/components/Carousel";
import { FaCircleChevronLeft } from "react-icons/fa6";
import LocationMarker from "@/components/LocationMarker";
import BedroomsDisplay from "@/components/BedroomsDisplay";
import AmenitiesDisplay from "@/components/AmenitiesDisplay";
import UtilitiesDisplay from "@/components/UtilitiesDisplay";
import ImageGrid from "@/components/ImageGrid";
import ModalCarousel from "@/components/ModalCarousel";
import BottomBar from "@/components/BottomBar";
import Skeleton from "@/components/Skeleton";
import { usePusher } from "@/hooks/usePusher";
import { fetchWithTimeout } from "@/utils/utils";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { REJECTED_REQUEST_BUFFER_HOURS } from "@/utils/constants";
import { CircularProgress } from "@mui/material";

// moved fetchWithTimeout to utils, since I'm using it in the request page now too - nathan

// Getting listing details on server side
export async function getServerSideProps(context) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        // Redirect to a custom error page
        return {
            notFound: true,
        };
    }

    const { listingId } = context.params;
    const response = await fetchWithTimeout(`${apiUrl}/api/listings/${listingId}`, {}, 5000);

    // Handle fetch failure
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
    return { props: { listing } };
}

const Listing = ({ listing }) => {
    // get listing ID from route params
    const router = useRouter();

    // get pusher context
    const pusher = usePusher();

    // get user context
    const { user: contextUser, status } = useAuth();

    // derived state or computations
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

    // non computed state declarations
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showGrid, setShowGrid] = useState(false);
    const [showModalCarousel, setShowModalCarousel] = useState(false);

    const [allRequests, setAllRequests] = useState([]);
    const [highestPendingRequest, setHighestPendingRequest] = useState(null);
    const [numPendingRequests, setNumPendingRequests] = useState(null);

    const [host, setHost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // update requests and host info on client side
    useEffect(() => {
        setLoading(true);

        // fetch all requests for listing
        const fetchAllRequests = async () => {
            const response = await fetch(`/api/requests/listingrequests/${listing._id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch requests :(");
            }
            const data = await response.json();
            setAllRequests(data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))); // sorting by updatedAt

            // get pending requests
            const pendingRequests = data.filter((req) => req.status === "pending");
            setNumPendingRequests(pendingRequests.length);

            // get highest pending request (null if no pending requests)
            if (pendingRequests.length === 0) {
                setHighestPendingRequest(null);
            } else {
                setHighestPendingRequest(Math.max(...pendingRequests.map((req) => req.price || 0)));
            }
        };
        fetchAllRequests();

        // fetch host
        const fetchHost = async () => {
            const response = await fetch(`/api/users/${listing?.userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch host :(");
            }
            const data = await response.json();
            setHost(data);
        };
        fetchHost();

        setLoading(false);
    }, [listing]);

    // useEffect for pusher realtime connection to update highestPendingRequest and active bid number
    useEffect(() => {
        // check if pusher is initialized
        if (pusher) {
            //check if already subscribed
            if (!pusher.channel(listing._id)) {
                // Subscribe to the channel
                const channel = pusher.subscribe(listing._id);

                channel.bind("pusher:subscription_succeeded", () => {
                    console.log("subscribed!");

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
                });
            }

            // Unbind all events and unsubscribe when component unmounts if subscribed
            return () => {
                const channel = pusher.channel(listing._id);
                const subscribed = channel?.subscribed;
                if (subscribed) {
                    channel.unbind();
                    pusher.unsubscribe(listing._id);
                    console.log("unsubscribed!");
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

    // loading component for host
    const LoadingHost = () => {
        return <Skeleton className="h-6 w-full" />;
    };

    // loading component for bottom bar content
    const LoadingBottomBarContent = () => {
        return <Skeleton className="h-11 w-3/4" />;
    };

    // function to create new request and redirect to request page
    const createNewRequest = () => {
        router.push(`/listing/${listing._id}/create-request`);
    };

    // function to display bottom bar content
    const renderBottomBarContent = () => {
        if (!contextUser) {
            // if user is not logged in, show login button
            return (
                <div className="flex flex-col gap-3">
                    <p className="text-xs text-slate-500">
                        You are not logged in. Please sign in or sign up to put in a request.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Link
                            className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border border-slate-500 text-slate-500 cursor-pointer"
                            href="/auth/signin"
                        >
                            Sign In
                        </Link>
                        <Link
                            className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border bg-color-primary text-white cursor-pointer"
                            href="/auth/signup"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            );
        } else {
            // otherwise we have a logged in user. more checks here.

            // check if user is host
            if (contextUser.id === listing.userId) {
                return (
                    <div className="flex flex-col gap-3 items-center">
                        <p className="text-xs text-slate-500">This is your listing.</p>
                        <Link
                            className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border bg-color-primary text-white cursor-pointer"
                            href={`/host/listing/${listing._id}`}
                        >
                            View Host Page
                        </Link>
                    </div>
                );
            } else {
                // user is not host. check pending requests

                // find user's pending request for this listing (if any)
                const userPendingRequest = allRequests.find(
                    (req) => req.subTenantId === contextUser.id && req.status === "pending"
                );
                const hasPendingRequest = !!userPendingRequest;

                if (hasPendingRequest) {
                    // user already has a pending request, show edit request button
                    return (
                        <div className="flex flex-col gap-3 items-center">
                            <p className="text-xs text-slate-500">
                                You've already put in a request for this listing.
                            </p>
                            <Link
                                className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border bg-color-primary text-white cursor-pointer"
                                href={`/request/${userPendingRequest._id}`}
                            >
                                Edit Request
                            </Link>
                        </div>
                    );
                } else {
                    // user doesn't have an existing pending request. check if verified/has rejected request in last 12 hours
                    // const isVerified = contextUser.isVerified; // will implement this later
                    const isVerified = true;
                    const userRejectedRequest = allRequests.find(
                        (req) => req.subTenantId === contextUser.id && req.status === "rejected"
                    ); // will fetch most recent
                    const isRecentlyRejected =
                        userRejectedRequest &&
                        new Date() - new Date(userRejectedRequest.updatedAt) <
                            REJECTED_REQUEST_BUFFER_HOURS * 1000 * 60 * 60;

                    if (!isVerified || isRecentlyRejected) {
                        // user is unverified or has a rejected request in last 12 hours, show greyed out button
                        return (
                            <div>
                                <p className="text-xs text-color-error">
                                    {!isVerified
                                        ? "Please get verified to put in a request."
                                        : "Please wait 12 hours since your last rejected request."}
                                </p>
                                <button
                                    disabled
                                    className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border bg-color-primary text-white cursor-pointer"
                                >
                                    Put in a Request
                                </button>
                            </div>
                        );
                    } else {
                        // user is verified and has no rejected requests in last 12 hours, show request button
                        return (
                            <button
                                className="text-base inline-flex items-center justify-center h-11 px-8 py-2 rounded-md border bg-color-primary text-white cursor-pointer"
                                onClick={createNewRequest}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Put in a Request"
                                )}
                            </button>
                        );
                    }
                }
            }
        }
    };

    return (
        <>
            {/* Back button */}
            {!showGrid && !showModalCarousel && (
                <div className="absolute top-0 left-0 w-fit z-[100] p-4" onClick={router.back}>
                    <FaCircleChevronLeft className="text-2xl text-gray-800" />
                </div>
            )}

            {/* Main content */}
            <div
                className={
                    !showGrid && !showModalCarousel
                        ? "flex flex-col no-underline text-black overflow-hidden pb-24"
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
                            {loading ? (
                                <LoadingBids />
                            ) : (
                                <>
                                    <p>
                                        {highestPendingRequest
                                            ? `$${highestPendingRequest} (Highest Bid)`
                                            : `$${listing.price} (Listing Price)`}
                                    </p>
                                    <p>
                                        {numPendingRequests} active bid
                                        {numPendingRequests === 1 ? "" : "s"}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Dynamically load hostname */}
                    <div className="py-4 border-b-[0.1rem] border-gray-300 text-xl">
                        <div className="flex flex-wrap items-center gap-1">
                            <div className="min-w-0">Entire suite subletted by</div>
                            <span className="font-bold flex-grow flex-shrink">
                                {!host ? <LoadingHost /> : host?.firstName}
                            </span>
                        </div>
                        <div className="mt-2">
                            <p>{formattedRoomInfo}</p>
                        </div>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <p className="text-lg">
                            {listing.description?.length > 250
                                ? listing.description?.substring(0, 250).listing + "..."
                                : listing.description}
                        </p>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <h2 className="text-2xl font-bold">Bedrooms</h2>
                        <BedroomsDisplay bedrooms={listing.basics.bedrooms} />
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <h2 className="text-2xl font-bold">Utilities</h2>
                        <UtilitiesDisplay utilities={listing.utilities} />
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <h2 className="text-2xl font-bold">What this place offers</h2>
                        <AmenitiesDisplay amenities={listing.amenities} />
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300 h-[300px]">
                        <h2 className="text-2xl font-bold">Location</h2>
                        <LocationMarker
                            className="mt-2"
                            lat={listing.location.lat}
                            lng={listing.location.lng}
                        />
                    </div>
                    <div className="py-4">
                        <h2 className="text-2xl font-bold mb-4">Legal</h2>
                        <div className="flex flex-col gap-6">
                            <div>
                                <div className="font-semibold text-lg">Health & Safety</div>
                                <p>
                                    SOME GIBBERISH THIS WILL PROBS BE A COMPONENTTTTTTTTTTTT I DONT
                                    WANNA REWRITE THIS SHIT EVERYTIME
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold text-lg">Sublet Policy</div>
                                <p>
                                    SOME GIBBERISH THIS WILL PROBS BE A COMPONENTTTTTTTTTTTT I DONT
                                    WANNA REWRITE THIS SHIT EVERYTIME
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold text-lg">Report this listing</div>
                                <p>
                                    SOME GIBBERISH THIS WILL PROBS BE A COMPONENTTTTTTTTTTTT I DONT
                                    WANNA REWRITE THIS SHIT EVERYTIME
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <BottomBar>
                    {status === "loading" ? <LoadingBottomBarContent /> : renderBottomBarContent()}
                </BottomBar>
            </div>
        </>
    );
};

export default Listing;
