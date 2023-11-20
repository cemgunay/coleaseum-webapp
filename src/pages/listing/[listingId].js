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
import { PusherContext } from "@/context/PusherContext";

// This function can be used to set a timeout on fetch requests
async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    }).catch((error) => {
        clearTimeout(id);
        return { error: true, message: error.message };
    });

    clearTimeout(id);
    return response;
}

//Getting listing details on server side
export async function getServerSideProps(context) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        // Redirect to a custom error page
        return {
            notFound: true,
        };
    }

    const { listingId } = context.params;
    const response = await fetchWithTimeout(
        `${apiUrl}/api/listings/${listingId}`,
        {},
        5000
    );

    // Handle fetch failure
    if (response.error) {
        console.error("Fetch failed: ", response.message);
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
    const [highestRequest, setHighestRequest] = useState(null);
    const [numberOfRequests, setNumberOfRequests] = useState(null);
    const [user, setUser] = useState(null);

    //useEffect to update requests and user on client side
    useEffect(() => {
        // fetch active requests for listing
        const fetchActiveRequests = async () => {
            const response = await fetch(
                `/api/requests/listingactiverequests/${listing._id}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch active requests :(");
            }
            const activeRequests = await response.json();
            const activeRequestPrices = activeRequests.map(
                (req) => req.price || 0
            );
            setHighestRequest(Math.max(...activeRequestPrices));
            setNumberOfRequests(activeRequests.length);
        };

        fetchActiveRequests();

        // fetch user
        const fetchUser = async () => {
            const response = await fetch(`/api/users/${listing?.userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user :(");
            }
            const data = await response.json();
            setUser(data);
        };

        fetchUser();
    }, [listing]);

    //useEffect for pusher realtime connection to update highestRequest and active bid number
    useEffect(() => {
        // check if pusher is initialized
        if (pusher) {
            //check if already subscribed
            if (!pusher.channel("bids-channel")) {
                // Subscribe to the channel
                const channel = pusher.subscribe("bids-channel");

                channel.bind("pusher:subscription_succeeded", () => {
                    console.log("subscribed!");

                    // Bind to bid update events
                    channel.bind("bid-updated", (data) => {
                        if (data.listingId === listing._id) {
                            setHighestRequest(data.newHighestBid);
                        }
                    });

                    // Bind to bid create events
                    channel.bind("bid-created", (data) => {
                        if (data.listingId === listing._id) {
                            setNumberOfRequests(
                                (prevNumberOfRequests) =>
                                    prevNumberOfRequests + 1
                            );
                        }
                    });
                });
            }

            // Unbind all events and unsubscribe when component unmounts if subscribed
            return () => {
                const channel = pusher.channel("bids-channel");
                const subscribed = channel?.subscribed;
                if (subscribed) {
                    channel.unbind();
                    pusher.unsubscribe("bids-channel");
                    console.log("unsubscribed!");
                }
            };
        }
    }, [pusher]);

    // still not sure if this state is needed in new version yet
    // might need it for the BottomBar component

    // const [isBookedByUser, setIsBookedByUser] = useState(false);
    // const [booking, setBooking] = useState(null);
    // const [requests, setRequests] = useState([]);
    // const [activeRequests, setActiveRequests] = useState([]);

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
                            {!highestRequest ? (
                                <LoadingBids />
                            ) : (
                                <>
                                    <p>
                                        {highestRequest > 0
                                            ? `$${highestRequest} (Highest Bid)`
                                            : `$${listing.price} (Listing Price)`}
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
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <p className="text-lg">
                            {listing.description?.length > 250
                                ? listing.description?.substring(0, 250)
                                      .listing + "..."
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
                        <h2 className="text-2xl font-bold">
                            What this place offers
                        </h2>
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
                                <div className="font-semibold text-lg">
                                    Health & Safety
                                </div>
                                <p>
                                    SOME GIBBERISH THIS WILL PROBS BE A
                                    COMPONENTTTTTTTTTTTT I DONT WANNA REWRITE
                                    THIS SHIT EVERYTIME
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold text-lg">
                                    Sublet Policy
                                </div>
                                <p>
                                    SOME GIBBERISH THIS WILL PROBS BE A
                                    COMPONENTTTTTTTTTTTT I DONT WANNA REWRITE
                                    THIS SHIT EVERYTIME
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold text-lg">
                                    Report this listing
                                </div>
                                <p>
                                    SOME GIBBERISH THIS WILL PROBS BE A
                                    COMPONENTTTTTTTTTTTT I DONT WANNA REWRITE
                                    THIS SHIT EVERYTIME
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <BottomBar />
            </div>
        </>
    );
};

export default Listing;
