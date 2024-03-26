import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { fetchWithTimeout, formatPrice, cn } from "@/utils/utils";
import { FaCircleChevronLeft } from "react-icons/fa6";
import Carousel from "@/components/Carousel";
import { format, differenceInMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    ACTIVE_STATUSES,
    PAST_STATUSES,
    CONFIRMED_STATUSES,
} from "@/utils/constants";
import { MdDeleteForever } from "react-icons/md";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { useToast } from "@/components/ui/use-toast";
import BottomBar from "@/components/BottomBar";
import Input from "@/components/Input";
import CustomDialog from "@/components/CustomDialog";
import FullScreenLoader from "@/components/FullScreenLoading";

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
    const response = await fetchWithTimeout(
        `${apiUrl}/api/requests/${requestId}`,
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
    if (!response.ok) {
        if (response.status === 404) {
            return { notFound: true };
        } else {
            throw new Error(`HTTP Error: ${response.status}`);
        }
    }

    const request = await response.json();

    // if request fetch was successful, fetch the associated listing and its active requests
    if (request && request.listingId) {
        // get listing from DB
        const listingResponse = await fetchWithTimeout(
            `${apiUrl}/api/listings/${request.listingId}`,
            {},
            5000
        );

        // get active requests for listing from DB
        const activeRequestsResponse = await fetchWithTimeout(
            `${apiUrl}/api/requests/listingactiverequests/${request.listingId}`,
            {},
            5000
        );

        // error handling
        if (listingResponse.error || !listingResponse.ok) {
            console.error(
                "Failed to fetch listing for this request: ",
                listingResponse.error || `HTTP Error: ${listingResponse.status}`
            );
        } else if (activeRequestsResponse.error || !activeRequestsResponse.ok) {
            console.error(
                "Failed to fetch active requests for the listing associated with this request: ",
                activeRequestsResponse.error ||
                    `HTTP Error: ${activeRequestsResponse.status}`
            );
        } else {
            const listing = await listingResponse.json();
            const activeRequests = await activeRequestsResponse.json();
            return { props: { request, listing, activeRequests } };
        }
    }

    // something's up if we reach here, means we didn't successfully fetch the listing
}

const Request = ({ request, listing, activeRequests }) => {
    const router = useRouter();

    // state
    const [priceOffer, setPriceOffer] = useState(request.price);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // for toast notifications
    const { toast } = useToast();

    // handler functions for modal + deletion events
    // could have set the state right in the JSX but I think this is more readable
    // also if we ever wanna add like click event tracking or smth it'll be easier to add
    const handleOpenDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const handleOpenRejectModal = () => {
        setShowRejectModal(true);
    };

    const handleOpenAcceptModal = () => {
        setShowAcceptModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleCloseRejectModal = () => {
        setShowRejectModal(false);
    };

    const handleCloseAcceptModal = () => {
        setShowAcceptModal(false);
    };

    const startDeleteProcess = (e) => {
        e.stopPropagation();
        handleOpenDeleteModal();
    };

    const startRejectProcess = (e) => {
        e.stopPropagation();
        handleOpenRejectModal();
    };

    const startAcceptProcess = (e) => {
        e.stopPropagation();
        handleOpenAcceptModal();
    };

    const handleConfirmDelete = () => {
        handleRejectRequest();
        handleCloseDeleteModal();
    };

    const handleConfirmReject = () => {
        handleRejectRequest();
        handleCloseRejectModal();
    };

    const handleConfirmAccept = () => {
        handleAcceptRequest();
        handleCloseAcceptModal();
    };

    const handleCancelDelete = () => {
        handleCloseDeleteModal();
    };

    const handleCancelReject = () => {
        handleCloseRejectModal();
    };

    const handleCancelAccept = () => {
        handleCloseAcceptModal();
    };

    // handle delete request
    const handleDeleteRequest = async () => {
        try {
            // API call to soft delete the request
            // hardcoding request._id here instead of taking it as an arg to this function bc
            // deletion on this page can only ever delete this page's request
            const response = await fetch(
                `/api/requests/${request._id}/delete`,
                {
                    method: "PATCH",
                }
            );

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

    // highest active request calculation
    const { highestActiveRequest, isCurrentRequestHighest } = useMemo(() => {
        const sortedActiveRequests = [...activeRequests].sort(
            (a, b) => b.price - a.price
        );
        const highestActiveRequest = sortedActiveRequests[0];
        const isCurrentRequestHighest =
            highestActiveRequest && highestActiveRequest._id === request._id;

        return { highestActiveRequest, isCurrentRequestHighest };
    }, [request, activeRequests]);

    // derived state for listing info
    const { formattedAddress, formattedRoomInfo, listingImages } =
        useMemo(() => {
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

    // function to generate tailwind classes for title depending on request status
    const titleClass = (status) => {
        return cn(
            "w-full h-8 text-slate-100 font-medium flex justify-center items-center",
            PAST_STATUSES.includes(status) && "bg-color-error",
            ACTIVE_STATUSES.includes(status) && "bg-color-warning",
            CONFIRMED_STATUSES.includes(status) && "bg-color-pass"
        );
    };

    // function to update request
    const updateRequest = async () => {
        setLoading(true);

        // update request
        const response = await fetch("/api/requests/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requestId: request._id,
                listingId: listing._id,
                newPrice: priceOffer,
                currentHighestBid: highestActiveRequest.price,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update request :(");
        }

        const updatedRequest = await response.json();
        console.log("updated request: ", updatedRequest);

        setLoading(false);

        // refresh request page
        router.reload();
    };

    // function to accept request
    const acceptRequest = async () => {
        setLoading(true);

        // update request
        const response = await fetch("/api/requests/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requestId: request._id,
                listingId: listing._id,
                newPrice: priceOffer,
                currentHighestBid: highestActiveRequest.price,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update request :(");
        }

        const updatedRequest = await response.json();
        console.log("updated request: ", updatedRequest);

        setLoading(false);

        // refresh request page
        router.reload();
    };

    // function to reject request
    const handleRejectRequest = async () => {
        setLoading(true);

        try {
            // API call to reject the request
            // hardcoding request._id here instead of taking it as an arg to this function bc
            // rejection on this page can only ever reject this page's request
            const response = await fetch(
                `/api/requests/${request._id}/reject`,
                {
                    method: "PATCH",
                }
            );

            // error handling
            if (!response.ok) {
                console.log(response);
                throw new Error("Failed to reject request");
            }
        } catch (error) {
            console.log(`Error deleting request: ${error}`);
            toast({
                variant: "destructive",
                title: "Failed to delete request :(",
                description: error,
            });
        }

        // push to host listing page
        router.push(`/host/listing/${listing._id}`);
    };

    // function to reject request
    const handleAcceptRequest = async () => {
        setLoading(true);

        try {
            // API call to accept the request
            // hardcoding request._id here instead of taking it as an arg to this function bc
            // accepting on this page can only ever accept this page's request
            const response = await fetch(
                `/api/requests/${request._id}/accept`,
                {
                    method: "POST",
                }
            );

            // error handling
            if (!response.ok) {
                console.log(response);
                throw new Error("Failed to accept request");
            }
        } catch (error) {
            console.log(`Error accepting request: ${error}`);
            toast({
                variant: "destructive",
                title: "Failed to accept request :(",
                description: error,
            });
        }

        // push to host listing page
        router.push(`/host/listing/${listing._id}`);
    };

    if (loading) {
        return <FullScreenLoader />;
    }

    return (
        <>
            {/* Back button */}
            <button
                className="absolute top-11 left-4 w-fit z-[50]"
                onClick={router.back}
            >
                <FaCircleChevronLeft className="text-2xl text-gray-800" />
            </button>

            {/* Delete button */}
            {PAST_STATUSES.includes(request.status) && (
                <button
                    className="absolute top-11 right-4 w-fit z-[50] hover:cursor-pointer"
                    onClick={(e) => startDeleteProcess(e)}
                >
                    <MdDeleteForever className="text-3xl text-gray-800 hover:text-color-error" />
                </button>
            )}

            {/* Delete modal */}
            {showDeleteModal && (
                <ConfirmDeleteDialog
                    open={showDeleteModal}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}

            {/* Reject modal */}
            {showRejectModal && (
                <CustomDialog
                    open={showRejectModal}
                    title={"Are you sure you want to reject?"}
                    action={"Reject"}
                    onClose={handleCloseRejectModal}
                    onConfirm={handleConfirmReject}
                    onCancel={handleCancelReject}
                />
            )}

            {/* Accept modal */}
            {showAcceptModal && (
                <CustomDialog
                    open={showAcceptModal}
                    title={"Are you sure you want to accept?"}
                    action={"Accept"}
                    bgColor={"bg-color-pass"}
                    onClose={handleCloseAcceptModal}
                    onConfirm={handleConfirmAccept}
                    onCancel={handleCancelAccept}
                />
            )}

            {/* Main content */}
            <div className="flex flex-col text-black overflow-hidden pb-16">
                {/* title */}
                <div className={titleClass(request.status)}>
                    REQUEST TO SUBLET
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
                            <h3 className="text-2xl font-bold">
                                {listing.title}
                            </h3>
                            {ACTIVE_STATUSES.includes(request.status) && (
                                <div className="flex items-center justify-center py-1 px-3 my-1 text-sm font-semibold text-green-500 rounded-full border border-color-pass">
                                    Highest offer:{" "}
                                    {highestActiveRequest
                                        ? formatPrice(
                                              highestActiveRequest.price,
                                              false
                                          )
                                        : "N/A"}{" "}
                                    {isCurrentRequestHighest
                                        ? "(this offer)"
                                        : "(not this offer)"}
                                </div>
                            )}
                        </div>
                        <address className="text-lg">
                            {formattedAddress}
                        </address>
                        <p className="mt-2 text-xl">{formattedRoomInfo}</p>
                        <p className="mt-2 text-lg text-center font-semibold">{`$${listing.price} Listing Price`}</p>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <h3 className="text-2xl font-bold mb-2">Price Offer</h3>
                        <div className="flex justify-center items-center">
                            <Input
                                className={"w-24"}
                                value={`$ ${priceOffer}`}
                                disabled
                            />
                        </div>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300 flex flex-col gap-4 text-lg">
                        <h3 className="text-2xl font-bold">Your Request</h3>
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <h4 className="font-semibold">Move In:</h4>
                                {`${format(
                                    new Date(listing.moveInDate),
                                    "MMM"
                                )}`}{" "}
                                {`${format(
                                    new Date(listing.moveInDate),
                                    "do, yyyy"
                                )}`}
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-semibold">Move Out:</h4>
                                {`${format(
                                    new Date(listing.moveOutDate),
                                    "MMM"
                                )}`}{" "}
                                {`${format(
                                    new Date(listing.moveOutDate),
                                    "do, yyyy"
                                )}`}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-semibold">Price Details:</h4>
                            <div className="flex items-center justify-between">
                                <p>
                                    ${priceOffer.toLocaleString()} x {numMonths}{" "}
                                    month
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
                        {ACTIVE_STATUSES.includes(request.status) && (
                            <div className="flex justify-between items-center gap-4">
                                <Button
                                    className="bg-color-primary w-full"
                                    onClick={(e) => startAcceptProcess(e)}
                                >
                                    Accept Request
                                </Button>
                                <Button
                                    className="w-full"
                                    onClick={(e) => startRejectProcess(e)}
                                    variant="destructive"
                                >
                                    Reject Request
                                </Button>
                            </div>
                        )}
                    </div>
                </BottomBar>
            </div>
        </>
    );
};

export default Request;
