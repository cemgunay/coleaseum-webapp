import React, { useState, useMemo, useEffect } from "react";
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
import { useListingForm } from "@/hooks/useListingForm";

const Preview = () => {
    //initialize router
    const router = useRouter();

    //get context from listing form
    const { isLoading, listingId, combinedListingFormState } = useListingForm();

    //shorthand listing from context state
    const listing = combinedListingFormState;

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
        const numBathrooms =
            listing.basics.bathrooms === null ? 0 : listing.basics.bathrooms;
        const formattedRoomInfo = `${numBeds} bed${
            numBeds === 1 ? "" : "s"
        } • ${numBedrooms} bedroom${
            numBedrooms === 1 ? "" : "s"
        } • ${numBathrooms} bathroom${numBathrooms === 1 ? "" : "s"}`;
        const images = listing.images.map(({ cloudinaryUrl }) => cloudinaryUrl);

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
    const [user, setUser] = useState(null);

    useEffect(() => {
        // fetch user
        const fetchUser = async () => {
            console.log(listing);
            const response = await fetch(`/api/users/${listing?.userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch user :(");
            }
            const data = await response.json();
            setUser(data);
        };

        if (listing.userId) {
            fetchUser();
        }
    }, [listing]);

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

    const handleBack = () => {
        router.push(`/host/manage-listings/${listingId}/edit`);
    };

    // loading component for entire component
    const Loading = () => {
        return (
            <div className="flex flex-col h-screen w-full">
                <Skeleton className="h-60 w-full rounded-none mb-6" />
                <div className="mx-8">
                    <div className="flex flex-col gap-2 pb-4 border-b-2">
                        <Skeleton className="h-8 w-1/3 " />
                        <Skeleton className="h-6 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 py-4 border-b-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="py-4 border-b-2">
                        <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="flex flex-col gap-2 py-4 border-b-2">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-32 w-24" />
                            <Skeleton className="h-32 w-24" />
                            <Skeleton className="h-32 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // loading component for user
    const LoadingUser = () => {
        return <Skeleton className="h-6 w-full" />;
    };

    //Load the loading component when still fetfching data
    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            {/* Back button */}
            {!showGrid && !showModalCarousel && (
                <div
                    className="absolute top-0 left-0 w-fit z-[100] p-4"
                    onClick={handleBack}
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
                        <div className="flex justify-between mt-2 text-lg">
                            <p>{`$${listing.price} (Listing Price)`}</p>
                            <p>No active bid</p>
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

export default Preview;
