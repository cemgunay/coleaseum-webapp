import React, { useState, useMemo, useEffect } from "react";
import SubletsTabs from "@/components/SubletsTabs";
import Skeleton from "@/components/Skeleton";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import GuestPage from "@/components/GuestPage";
import ListingItemWithRequests from "@/components/ListingItemWithRequests";
import ListingItemForSublets from "@/components/ListingItemForSublets";
import {
    ACTIVE_STATUSES,
    PAST_STATUSES,
    CONFIRMED_STATUSES,
} from "@/utils/constants";

const Sublets = () => {
    // get user object from context
    const { user, status } = useAuth();

    // state
    const [activeTab, setActiveTab] = useState("active");
    const [listings, setListings] = useState([]);
    const [displayListings, setDisplayListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [fetching, setFetching] = useState(true);

    // fetch listings and requests from DB
    useEffect(() => {
        const fetchListingsAndRequests = async () => {
            // if no user we can't fetch their requests
            if (!user) return;

            // fetch listings and requests
            const responseListings = await fetch(`/api/listings`);
            const responseRequests = await fetch(
                `/api/requests/user-requests/${user.id}`
            );

            // error handling
            if (!responseListings.ok) {
                console.log("Error fetching listings: ", responseListings);
                throw new Error("Failed to fetch listings");
            }
            if (!responseRequests.ok) {
                console.log("Error fetching requests: ", responseRequests);
                throw new Error("Failed to fetch requests");
            }

            const receivedListings = await responseListings.json();
            const receivedRequests = await responseRequests.json();

            setListings(
                receivedListings.sort(
                    (p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt)
                )
            );
            setRequests(receivedRequests);
            setFetching(false);
        };

        fetchListingsAndRequests();
    }, [user]);

    // memoized filtered request IDs
    // basically we have arrays containing the desired statuses for each type of request (active, past, confirmed)
    // here we filter the requests array to get the IDs of the listings that have requests with those statuses
    const activeRequestListingIds = useMemo(() => {
        return requests
            .filter((request) => ACTIVE_STATUSES.includes(request.status))
            .map((request) => request.listingId);
    }, [requests]);
    const pastRequestListingIds = useMemo(() => {
        return requests
            .filter((request) => PAST_STATUSES.includes(request.status))
            .map((request) => request.listingId);
    }, [requests]);
    const confirmedRequestListingIds = useMemo(() => {
        return requests
            .filter((request) => CONFIRMED_STATUSES.includes(request.status))
            .map((request) => request.listingId);
    }, [requests]);

    // memoized filtered listings
    // here we filter the listings array to get the listings with the IDs we got above, for each type of request
    const activeListings = useMemo(() => {
        return listings.filter((listing) =>
            activeRequestListingIds.includes(listing._id)
        );
    }, [listings]);
    const pastListings = useMemo(() => {
        return listings.filter((listing) =>
            pastRequestListingIds.includes(listing._id)
        );
    }, [listings]);
    const confirmedListings = useMemo(() => {
        return listings.filter((listing) =>
            confirmedRequestListingIds.includes(listing._id)
        );
    }, [listings]);

    // useEffect to update displayListings when activeTab changes
    useEffect(() => {
        switch (activeTab) {
            case "active":
                setDisplayListings(activeListings);
                break;
            case "past":
                setDisplayListings(pastListings);
                break;
            case "confirmed":
                setDisplayListings(confirmedListings);
                break;
            default:
                setDisplayListings([]);
        }
    }, [activeTab]);

    // loading component
    const Loading = () => {
        return (
            <>
                {[...Array(3)].map((_, i) => (
                    <div className="flex flex-col gap-3 w-full" key={i}>
                        <Skeleton className="w-full h-52" />
                        <Skeleton className="w-1/6 h-5" />
                        <Skeleton className="w-1/2 h-5" />
                        <div className="flex justify-between w-full h-5 mb-7">
                            <Skeleton className="w-1/3" />
                            <Skeleton className="w-1/4" />
                        </div>
                    </div>
                ))}
            </>
        );
    };

    // function to remove a listing from the list if all of its requests are deleted
    // unused for now but will implement soon
    const handleDeleteListing = async (listingId) => {
        // update listings state
        const updatedListings = listings.filter(
            (listing) => listing.id !== listingId
        );
        setListings(updatedListings);
    };

    // this is to ensure we don't get any flashing of the Guest page or the "# of listings" text
    // only care about the "fetching" prop if user is signed in, otherwise won't be fetching anything
    if (status === "loading" || (user && fetching)) {
        return (
            <>
                <div className="flex flex-col items-center justify-start min-h-screen mx-8 pt-10 pb-32">
                    <SubletsTabs setActiveTab={setActiveTab} />
                    <Loading />
                </div>
                <BottomNav />
            </>
        );
    }

    if (!user) {
        return <GuestPage contentToView="sublets" />;
    }

    return (
        <>
            <div className="flex flex-col items-center justify-start min-h-screen mx-8 pt-10 pb-32">
                <SubletsTabs setActiveTab={setActiveTab} />
                {listings.length && !fetching ? (
                    <>
                        <p className="self-start mb-1 text-gray-700 text-sm">
                            {displayListings.length} listing
                            {displayListings.length !== 1 && "s"} with{" "}
                            {activeTab} requests
                        </p>
                        <div className="grid grid-cols-1 gap-10 mt-2">
                            {displayListings.map((listing) => {
                                switch (activeTab) {
                                    case "past":
                                        const pastRequests = requests.filter(
                                            (request) =>
                                                PAST_STATUSES.includes(
                                                    request.status
                                                ) &&
                                                request.listingId ===
                                                    listing._id
                                        );
                                        return (
                                            <ListingItemWithRequests
                                                key={listing._id}
                                                listing={listing}
                                                requests={pastRequests}
                                                deleteListing={
                                                    handleDeleteListing
                                                }
                                            />
                                        );
                                    case "active":
                                        const activeRequests = requests.filter(
                                            (request) =>
                                                ACTIVE_STATUSES.includes(
                                                    request.status
                                                ) &&
                                                request.listingId ===
                                                    listing._id
                                        ); // should only be one request here
                                        return (
                                            <ListingItemForSublets
                                                key={listing._id}
                                                listing={listing}
                                                request={activeRequests[0]}
                                                activeTab={activeTab}
                                            />
                                        );
                                    case "confirmed":
                                        const confirmedRequests =
                                            requests.filter(
                                                (request) =>
                                                    CONFIRMED_STATUSES.includes(
                                                        request.status
                                                    ) &&
                                                    request.listingId ===
                                                        listing._id
                                            ); // should only be one request here
                                        return (
                                            <ListingItemForSublets
                                                key={listing._id}
                                                listing={listing}
                                                request={confirmedRequests[0]}
                                                activeTab={activeTab}
                                                showActiveBids={false}
                                            />
                                        );
                                }
                            })}
                        </div>
                    </>
                ) : (
                    <Loading />
                )}
            </div>
            <BottomNav />
        </>
    );
};

export default Sublets;
