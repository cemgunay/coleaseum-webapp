import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    getListingsInProgress,
    getListingsCompleted,
    getListingsBooked,
} from "../../../services/apiServices";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { transformCloudinaryImage } from "@/utils/cloudinary";
import { BsDot, BsPlusSquare } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { determineRoute } from "@/utils/determineRoute";
import Skeleton from "@/components/Skeleton";

import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { useToast } from "@/components/ui/use-toast";

const ManageListings = () => {
    //get context user from hook
    const { user: contextUser } = useAuth();

    // State Variables
    const [isLoading, setIsLoading] = useState(true);
    const [listingsInProgress, setListingsInProgress] = useState([]);
    const [listingsCompleted, setListingsCompleted] = useState([]);
    const [listingsBooked, setListingsBooked] = useState([]);

    //to show the confirm delete modal
    const [showModal, setShowModal] = useState(false);

    //selectedListingId to be deleted
    const [selectedListingId, setSelectedListingId] = useState(null);

    // for toast notifications
    const { toast } = useToast();

    // Add state variables for toggle states
    const [showAllInProgress, setShowAllInProgress] = useState(false);
    const [showAllCompleted, setShowAllCompleted] = useState(false);
    const [showAllBooked, setShowAllBooked] = useState(false);

    // Fetch Listings
    useEffect(() => {
        async function fetchData(userId) {
            setIsLoading(true);
            try {
                const inProgress = await getListingsInProgress(userId);
                setListingsInProgress(inProgress);

                const completed = await getListingsCompleted(userId);
                setListingsCompleted(completed);

                const booked = await getListingsBooked(userId);
                setListingsBooked(booked);
            } catch (error) {
                console.error("Error fetching listings", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (contextUser?.id) {
            fetchData(contextUser.id);
        }
    }, [contextUser]);

    // Handlers

    //handlers for deletion
    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleStartDelete = (listingId) => {
        setSelectedListingId(listingId);
        handleOpenModal();
    };

    const handleConfirmDelete = (listingId) => {
        handleDeleteRequest(listingId);
        handleCloseModal();
    };

    const handleCancelDelete = () => {
        handleCloseModal();
    };

    const handleDeleteRequest = async (listingId) => {
        try {
            // API call to delete the request
            const response = await fetch(`/api/listings/${listingId}/delete`, {
                method: "DELETE",
            });

            // error handling
            if (!response.ok) {
                console.log(response);
                throw new Error("Failed to delete request");
            }

            // Remove the listing from the state
            setListingsInProgress((prev) =>
                prev.filter((listing) => listing._id !== listingId)
            );

            // // console log the deleted request
            // const deletedRequest = await response.json();
            // console.log(deletedRequest);

            // toast notification
            toast({
                variant: "default",
                title: "Deleted!",
                description: "RIP to that listing ☠️",
            });
        } catch (error) {
            console.log(`Error deleting listing: ${error}`);
            toast({
                variant: "destructive",
                title: "Failed to delete listing :(",
                description: error,
            });
        }
    };

    //For each type of listing section
    const ListingSection = ({
        title,
        listings,
        showAll,
        setShowAll,
        onTrashClick,
    }) => {
        //set the nnumber of listings to show
        const displayedListings = showAll ? listings : listings.slice(0, 3);

        return (
            <div className="flex flex-col gap-4">
                <div>{title}</div>
                {displayedListings.map((listing) => (
                    <ListingItem
                        key={listing._id}
                        listing={listing}
                        title={title}
                        onTrashClick={onTrashClick}
                    />
                ))}
                {listings.length > 3 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm"
                    >
                        {showAll ? "Show Less" : "Show All"}
                    </button>
                )}
            </div>
        );
    };

    //listing item that holds a generic or actual cover photo and title along with status specific element
    const ListingItem = ({ listing, title, onTrashClick }) => {
        //functions to determine what image and title to use
        const genericImage =
            "https://res.cloudinary.com/dcytupemt/image/upload/v1700592646/coleaseum/rzbb3ej3m3gkk3rsv0ou.png";
        const imageUrl =
            listing.images.length > 0
                ? listing.images[0].cloudinaryUrl
                : genericImage;
        const { transformedImage, blurDataURL } = transformCloudinaryImage(
            imageUrl,
            "w_100,h_100,c_pad,b_white",
            "w_30,h_30,c_fill,e_blur:1000,q_auto:low"
        );
        const listingTitle =
            listing.title ||
            `Your listing started on ${format(
                parseISO(listing.createdAt),
                "PPP"
            )}`;
        const listingId = listing._id;
        console.log(listingId);

        // Define the URL based on the listing status
        let url;
        if (title === "Completed Listings") {
            url = `/host/manage-listings/${listing.id}/edit`; //go to edit page for that listing
        } else if (title === "In Progress Listings") {
            url = determineRoute(listing); //get the correct route using util function
        } else if (title === "Booked Listings") {
            url = `/host/${listing.id}`; //go to that listing
        }

        return (
            <div className="flex items-center justify-between border-2 p-2 rounded-lg">
                <Link href={url} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                            src={transformedImage}
                            alt={listingTitle}
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                            fill
                            style={{ objectFit: "contain" }}
                            sizes="33vw"
                        />
                    </div>
                    <div className="text-sm flex-grow max-w-xs">
                        {listingTitle}
                    </div>
                </Link>
                <div className="flex items-center justify-end flex-shrink-0">
                    <ListingStatus
                        title={title}
                        listing={listing}
                        onTrashClick={onTrashClick}
                    />
                </div>
            </div>
        );
    };

    //used to conditionally render any other needed elements in each listing item based on the listing status
    const ListingStatus = ({ title, listing, onTrashClick }) => {
        //if completed listing show the published status
        if (title === "Completed Listings") {
            return (
                <div className="flex items-center justify-center w-10">
                    <BsDot
                        className="text-4xl"
                        style={{
                            color: listing.published
                                ? "var(--color-pass)"
                                : "var(--color-error)",
                        }}
                    />
                </div>
            );
        }

        //if in progress listing show a delete button
        if (title === "In Progress Listings") {
            return (
                <div className="flex items-center justify-center w-10">
                    <BiTrash
                        className="text-xl"
                        onClick={() => onTrashClick(listing._id)}
                    />
                </div>
            );
        }
        return null;
    };

    //loading component
    const Loading = () => {
        return (
            <div className="flex flex-col m-8 gap-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            {/* Delete modal */}
            {showModal && selectedListingId && (
                <ConfirmDeleteDialog
                    open={showModal}
                    onClose={handleCloseModal}
                    onConfirm={() => handleConfirmDelete(selectedListingId)}
                    onCancel={handleCancelDelete}
                />
            )}

            <div className="flex flex-col m-8 gap-8">
                <div className="flex justify-between items-center">
                    <div className="font-bold">
                        {listingsInProgress.length + listingsCompleted.length}{" "}
                        listings
                    </div>
                    <Link href="/host/create-listing/info">
                        <div className="flex gap-2 items-center">
                            <div>Create new listing</div>
                            <BsPlusSquare />
                        </div>
                    </Link>
                </div>
                {/* Listings */}
                {listingsInProgress.length === 0 &&
                listingsCompleted.length === 0 ? (
                    <div>Create a new listing</div>
                ) : (
                    <>
                        <ListingSection
                            title="Completed Listings"
                            listings={listingsCompleted}
                            showAll={showAllCompleted}
                            setShowAll={setShowAllCompleted}
                        />
                        {listingsBooked.length > 0 && (
                            <ListingSection
                                title="Booked Listings"
                                listings={listingsBooked}
                                showAll={showAllBooked}
                                setShowAll={setShowAllBooked}
                            />
                        )}
                        <ListingSection
                            title="In Progress Listings"
                            listings={listingsInProgress}
                            showAll={showAllInProgress}
                            setShowAll={setShowAllInProgress}
                            onTrashClick={handleStartDelete}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default ManageListings;
