import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Carousel from "@/components/Carousel";
import { FaCircleChevronLeft } from "react-icons/fa6";
import LocationMarker from "@/components/LocationMarker";
import BedroomsDisplay from "@/components/BedroomsDisplay";
import AmenitiesDisplay from "@/components/AmenitiesDisplay";
import UtilitiesDisplay from "@/components/UtilitiesDisplay";
import ImageGrid from "@/components/ImageGrid";
import ModalCarousel from "@/components/ModalCarousel";

const Listing = () => {
    // get listing ID from route params
    const router = useRouter();
    const { listingId } = router.query;

    // state
    const [listing, setListing] = useState(null);
    const [formattedAddress, setFormattedAddress] = useState("");
    const [formattedRoomInfo, setFormattedRoomInfo] = useState("");
    const [images, setImages] = useState([]);
    const [highestRequest, setHighestRequest] = useState(0);
    const [numberOfRequests, setNumberOfRequests] = useState(0);
    const [user, setUser] = useState(null);
    const [showGrid, setShowGrid] = useState(false);
    const [showModalCarousel, setShowModalCarousel] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // still not sure if this state is needed in new version yet
    // might need it for the BottomBar component

    // const [isBookedByUser, setIsBookedByUser] = useState(false);
    // const [booking, setBooking] = useState(null);
    // const [requests, setRequests] = useState([]);
    // const [activeRequests, setActiveRequests] = useState([]);

    // fetch listing data from API
    useEffect(() => {
        // do nothing if listingId is not yet available
        if (!listingId) return;

        // fetch listing
        const fetchListing = async () => {
            const response = await fetch(`/api/listings/${listingId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch listing :(");
            }
            const data = await response.json();
            setListing(data);
        };
        fetchListing();

        // fetch active requests for listing
        const fetchActiveRequests = async () => {
            const response = await fetch(`/api/requests/listingactiverequests/${listingId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch active requests :(");
            }
            const activeRequests = await response.json();
            const activeRequestPrices = activeRequests.map((req) => req.price || 0);
            setHighestRequest(Math.max(...activeRequestPrices));
            setNumberOfRequests(activeRequests.length);
        };
        fetchActiveRequests();
    }, [listingId]);

    // fetch user data and populate listing info once listing is available
    useEffect(() => {
        // do nothing if listing is not yet available
        if (!listing) return;

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

        // format address for display
        const { address1, city, stateprovince } = listing.location;
        setFormattedAddress(`${address1}, ${city}, ${stateprovince}`);

        // format room info for display
        const numBeds = listing.basics.bedrooms.map((bedroom) => bedroom.bedType).length; // not sure of this logic, won't it just always be the same length as bedrooms?
        const numBedrooms = listing.basics.bedrooms.length;
        const numBathrooms = listing.basics.bathrooms;
        setFormattedRoomInfo(
            `${numBeds} bed${numBeds === 1 ? "" : "s"} • ${numBedrooms} bedroom${
                numBedrooms === 1 ? "" : "s"
            } • ${numBathrooms} bathroom${numBathrooms === 1 ? "" : "s"}`
        );

        // update images state if we have images
        if (listing.images.length) {
            setImages(listing?.images?.map(({ url }) => url));
        }
    }, [listing]);

    // function to handle image selection from grid
    const handleImageSelect = (index) => {
        setSelectedImageIndex(index);
        setShowGrid(false);
        setShowModalCarousel(true);
    };

    // show loading page until listing is successfully retrieved
    // TODO: get a proper loading screen, just text right now
    if (!listing) {
        return <div>Loading...</div>;
    } else {
        console.log(listing);
    }

    return (
        <>
            {!showGrid && !showModalCarousel && (
                <div className="absolute top-0 left-0 w-fit z-[100] p-4" onClick={router.back}>
                    <FaCircleChevronLeft className="text-2xl text-gray-800" />
                </div>
            )}

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
                        <div className="flex justify-between mt-4 text-lg">
                            <p>
                                {highestRequest > 0
                                    ? `$${highestRequest} (Highest Bid)`
                                    : `$${listing.price} (Listing Price)`}
                            </p>
                            <p>
                                {numberOfRequests} active bid{numberOfRequests === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300 text-xl">
                        Entire suite subletted by{" "}
                        <span className="font-bold">{user?.firstName}</span>
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
            </div>
        </>
    );
};

export default Listing;
