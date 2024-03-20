import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { fetchWithTimeout, formatPrice, cn } from "@/utils/utils";
import { FaCircleChevronLeft } from "react-icons/fa6";
import Carousel from "@/components/Carousel";
import IncrementalPriceInput from "@/components/IncrementalPriceInput";
import { format, differenceInMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BottomBar from "@/components/BottomBar";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/hooks/useAuth";

// multiplier for the ATIC value
const ATIC_MULTIPLIER = 2 * 0.04;

// get listing details on server side
export async function getServerSideProps(context) {
    // make sure we have an API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
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
    if (!response.ok) {
        if (response.status === 404) {
            return { notFound: true };
        } else {
            throw new Error(`HTTP Error: ${response.status}`);
        }
    }

    const listing = await response.json();

    // fetch the associated active requests
    const activeRequestsResponse = await fetchWithTimeout(
        `${apiUrl}/api/requests/listingactiverequests/${listingId}`,
        {},
        5000
    );

    // error handling
    if (activeRequestsResponse.error || !activeRequestsResponse.ok) {
        console.error(
            "Failed to fetch active requests for the listing associated with this request: ",
            activeRequestsResponse.error || `HTTP Error: ${activeRequestsResponse.status}`
        );
    } else {
        const activeRequests = await activeRequestsResponse.json();
        return { props: { listing, activeRequests } };
    }

    // something's up if we reach here, means we didn't successfully fetch the listing
}

const CreateRequest = ({ listing, activeRequests }) => {
    const router = useRouter();

    // state
    const [priceOffer, setPriceOffer] = useState(listing.price);
    const [submitting, setSubmitting] = useState(false);

    // for toast notifications
    const { toast } = useToast();

    // get user context
    const { user: contextUser } = useAuth();

    // highest active request calculation
    const { highestActiveRequest } = useMemo(() => {
        const sortedActiveRequests = [...activeRequests].sort((a, b) => b.price - a.price);
        const highestActiveRequest = sortedActiveRequests[0];

        return { highestActiveRequest };
    }, [activeRequests]);

    // derived state for listing info
    const { formattedAddress, formattedRoomInfo, listingImages } = useMemo(() => {
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
        const listingImages = listing.images.map(({ url }) => url);

        return {
            formattedAddress,
            formattedRoomInfo,
            listingImages,
        };
    }, [listing]);

    // derived state for request info
    const numMonths = useMemo(() => {
        const startDate = new Date(listing.moveInDate);
        const endDate = new Date(listing.moveOutDate);
        return differenceInMonths(endDate, startDate);
    }, [listing.moveInDate, listing.moveOutDate]);

    const atic = useMemo(() => {
        return priceOffer * ATIC_MULTIPLIER;
    }, [priceOffer]);

    const subtotal = useMemo(() => {
        return priceOffer * numMonths;
    }, [priceOffer, numMonths]);

    const total = useMemo(() => {
        return priceOffer * numMonths + Number(atic);
    }, [priceOffer, numMonths, atic]);

    const dueAtSigning = useMemo(() => {
        return priceOffer * numMonths * 0.5 + Number(atic);
    }, [priceOffer, numMonths, atic]);

    // function to create new request and redirect to request page
    const createNewRequestAndRedirect = async () => {
        try {
            setSubmitting(true);
            // create new request
            const response = await fetch("/api/requests/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listingId: listing._id,
                    tenantId: listing.userId,
                    subTenantId: contextUser.id,
                    price: priceOffer,
                }),
            });

            if (!response.ok) {
                toast({
                    variant: "destructive",
                    title: "Failed to create request :(",
                    description: response.error,
                });
                throw new Error("Failed to create request :(");
            }

            const newRequest = await response.json();
            console.log("new request: ", newRequest);

            // redirect to request page
            router.push(`/request/${newRequest._id}`);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "API Error :(",
                description: error,
            });
            throw new Error("API Error :(");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Back button */}
            <button className="absolute top-11 left-4 w-fit z-[50]" onClick={router.back}>
                <FaCircleChevronLeft className="text-2xl text-gray-800" />
            </button>

            {/* Main content */}
            <div className="flex flex-col text-black overflow-hidden pb-24">
                {/* title */}
                <div className="w-full h-8 text-slate-100 bg-color-pass font-medium flex justify-center items-center">
                    CREATING NEW REQUEST
                </div>

                {/* Main image carousel */}
                <div className="w-full h-60">
                    <Carousel
                        images={listingImages}
                        onClick={() => router.push(`/listing/${listing._id}`)}
                        index={0}
                        dots={true}
                    />
                </div>

                {/* Request info */}
                <div className="flex flex-col mx-8 pt-2 mb-16">
                    <div
                        className="py-4 border-b-[0.1rem] border-gray-300 hover:cursor-pointer"
                        onClick={() => router.push(`/listing/${listing._id}`)}
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <h3 className="text-2xl font-bold">{listing.title}</h3>
                            <div className="flex items-center justify-center py-1 px-3 my-1 text-sm font-semibold text-green-500 rounded-full border border-color-pass">
                                Highest offer:{" "}
                                {highestActiveRequest
                                    ? formatPrice(highestActiveRequest.price, false)
                                    : "N/A"}{" "}
                            </div>
                        </div>
                        <address className="text-lg">{formattedAddress}</address>
                        <p className="mt-2 text-xl">{formattedRoomInfo}</p>
                        <p className="mt-2 text-lg text-center font-semibold">{`$${listing.price} Listing Price`}</p>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <h3 className="text-2xl font-bold mb-2">Price Offer</h3>
                        <IncrementalPriceInput
                            priceOffer={priceOffer}
                            setPriceOffer={setPriceOffer}
                        />
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300 flex flex-col gap-4 text-lg">
                        <h3 className="text-2xl font-bold">New Request</h3>
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <h4 className="font-semibold">Move In:</h4>
                                {`${format(new Date(listing.moveInDate), "MMM")}`}{" "}
                                {`${format(new Date(listing.moveInDate), "do, yyyy")}`}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-semibold">Move Out:</h4>
                                {`${format(new Date(listing.moveOutDate), "MMM")}`}{" "}
                                {`${format(new Date(listing.moveOutDate), "do, yyyy")}`}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-semibold">Price Details:</h4>
                            <div className="flex items-center justify-between">
                                <p>
                                    ${priceOffer.toLocaleString()} x {numMonths} month
                                    {numMonths === 1 ? "" : "s"}
                                </p>
                                <p>{formatPrice(subtotal)} CAD</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p>ATIC</p>
                                <p>{formatPrice(atic)} CAD</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Total</p>
                            <p>{formatPrice(total)} CAD</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Due at Signing</p>
                            <p>{formatPrice(dueAtSigning)} CAD</p>
                        </div>
                    </div>
                </div>
                {/* sticky button */}
                <BottomBar>
                    <div className="flex flex-col gap-2 px-8">
                        <p className="text-xs text-center text-slate-500">
                            Change price offer to your liking and click below to submit the request.
                        </p>
                        <Button
                            className="bg-color-primary w-full"
                            disabled={submitting}
                            onClick={createNewRequestAndRedirect}
                        >
                            {submitting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Submit Request"
                            )}
                        </Button>
                    </div>
                </BottomBar>
            </div>
        </>
    );
};

export default CreateRequest;
