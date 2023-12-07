import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { fetchWithTimeout, formatPrice, cn } from "@/utils/utils";
import { FaCircleChevronLeft } from "react-icons/fa6";
import Carousel from "@/components/Carousel";
import IncrementalPriceInput from "@/components/IncrementalPriceInput";
import { format, differenceInMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ACTIVE_STATUSES, PAST_STATUSES, CONFIRMED_STATUSES } from "@/utils/constants";
import { MdDeleteForever } from "react-icons/md";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { useToast } from "@/components/ui/use-toast";

// multiplier for the ATIC value
const ATIC_MULTIPLIER = 2 * 0.04;

// get request details on server side
export async function getServerSideProps(context) {
    // make sure we have an API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        return {
            notFound: true,
        };
    }

    // get request from DB
    const { requestId } = context.params;
    const response = await fetchWithTimeout(`${apiUrl}/api/requests/${requestId}`, {}, 5000);

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

    const request = await response.json();

    // if request fetch was successful, fetch the associated listing
    if (request && request.listingId) {
        // get listing from DB
        const listingResponse = await fetchWithTimeout(
            `${apiUrl}/api/listings/${request.listingId}`,
            {},
            5000
        );

        // error handling
        if (listingResponse.error || !listingResponse.ok) {
            console.error(
                "Listing fetch failed: ",
                listingResponse.error || `HTTP Error: ${listingResponse.status}`
            );
            // NB if listing fetch fails, we still will render the request info
            // can change this later if we want to
        } else {
            const listing = await listingResponse.json();
            return { props: { request, listing } };
        }
    }

    // return the request alone if we didn't successfully fetch the listing
    return { props: { request } };
}

const Request = ({ request, listing }) => {
    const router = useRouter();

    // state
    const [priceOffer, setPriceOffer] = useState(request.price);
    const [showModal, setShowModal] = useState(false);

    // for toast notifications
    const { toast } = useToast();

    // handler functions for modal + deletion events
    // could have set the state right in the JSX but I think this is more readable
    // also if we ever wanna add like click event tracking or smth it'll be easier to add
    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const startDeleteProcess = (e) => {
        e.stopPropagation();
        handleOpenModal();
    };

    const handleConfirmDelete = () => {
        handleDeleteRequest();
        handleCloseModal();
    };

    const handleCancelDelete = () => {
        handleCloseModal();
    };

    // handle delete request
    const handleDeleteRequest = async () => {
        try {
            // API call to soft delete the request
            // hardcoding request._id here instead of taking it as an arg to this function bc
            // deletion on this page can only ever delete this page's request
            const response = await fetch(`/api/requests/${request._id}/delete`, {
                method: "PATCH",
            });

            // error handling
            if (!response.ok) {
                console.log(response);
                throw new Error("Failed to delete request");
            }

            // // console log the deleted request
            // const deletedRequest = await response.json();
            // console.log(deletedRequest);

            // toast notification
            toast({
                variant: "default",
                title: "Deleted!",
                description: "RIP to that request ☠️",
            });

            // push user back to previous page
            router.back();
        } catch (error) {
            console.log(`Error deleting request: ${error}`);
            toast({
                variant: "destructive",
                title: "Failed to delete request :(",
                description: error,
            });
        }
    };

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
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        return differenceInMonths(endDate, startDate);
    }, [request.startDate, request.endDate]);

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

    // function to generate tailwind classes for title depending on request status
    const titleClass = (status) => {
        return cn(
            "w-full h-8 text-slate-100 font-medium flex justify-center items-center",
            PAST_STATUSES.includes(status) && "bg-color-error",
            ACTIVE_STATUSES.includes(status) && "bg-color-warning",
            CONFIRMED_STATUSES.includes(status) && "bg-color-pass"
        );
    };

    return (
        <>
            {/* Back button */}
            <button className="absolute top-11 left-4 w-fit z-[50]" onClick={router.back}>
                <FaCircleChevronLeft className="text-2xl text-gray-800" />
            </button>

            {/* Delete button */}
            <button
                className="absolute top-11 right-4 w-fit z-[50] hover:cursor-pointer"
                onClick={(e) => startDeleteProcess(e)}
            >
                <MdDeleteForever className="text-3xl text-gray-800 hover:text-color-error" />
            </button>

            {/* Delete modal */}
            {showModal && (
                <ConfirmDeleteDialog
                    open={showModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}

            {/* Main content */}
            <div className="flex flex-col text-black overflow-hidden pb-24">
                {/* title */}
                <div className={titleClass(request.status)}>REQUEST TO SUBLET</div>

                {/* Main image carousel */}
                <div className="w-full h-60">
                    <Carousel
                        images={listingImages}
                        // onClick={() => setShowGrid(true)}
                        index={0}
                        dots={true}
                    />
                </div>

                {/* Request info */}
                <div className="flex flex-col mx-8 pt-2">
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <div className="flex justify-between">
                            <h3 className="text-2xl font-bold">{listing.title}</h3>
                            <p>{listing.days_left}</p>
                        </div>
                        <address className="text-lg">{formattedAddress}</address>
                        <p className="mt-2 text-xl">{formattedRoomInfo}</p>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <h3 className="text-2xl font-bold mb-2">Price Offer</h3>
                        <IncrementalPriceInput
                            priceOffer={priceOffer}
                            setPriceOffer={setPriceOffer}
                            disabled={
                                PAST_STATUSES.includes(request.status) ||
                                CONFIRMED_STATUSES.includes(request.status)
                            }
                        />
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300 flex flex-col gap-4 text-lg">
                        <h3 className="text-2xl font-bold">Your Request</h3>
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <h4 className="font-semibold">Move In:</h4>
                                {`${format(new Date(request.startDate), "MMM")}`}{" "}
                                {`${format(new Date(request.startDate), "do, yyyy")}`}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-semibold">Move Out:</h4>
                                {`${format(new Date(request.endDate), "MMM")}`}{" "}
                                {`${format(new Date(request.endDate), "do, yyyy")}`}
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
                    {/* non-sticky button */}
                    {/* <Button
                        className="bg-color-primary fixed bottom-0 w-full"
                        // button disabled if request is not active
                        disabled={
                            PAST_STATUSES.includes(request.status) ||
                            CONFIRMED_STATUSES.includes(request.status)
                        }
                    >
                        Submit Request
                    </Button> */}
                </div>
                {/* sticky button */}
                <footer className="fixed bottom-0 z-50 w-full">
                    {/* <div className="px-8 py-8 rounded-t-md shadow-lg border-0 border-black bg-white"> */}
                    <div className="flex items-center justify-around py-5 px-8 rounded-t-lg bg-white shadow-[0px_0px_5px_0px]">
                        <Button
                            className="bg-color-primary w-full"
                            // button disabled if request is not active
                            disabled={
                                PAST_STATUSES.includes(request.status) ||
                                CONFIRMED_STATUSES.includes(request.status)
                            }
                        >
                            Submit Request
                        </Button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Request;
