import React, { useState, useMemo, useEffect } from "react";
import SubletsTabs from "@/components/SubletsTabs";
import ListingItem from "@/components/ListingItem";
import Skeleton from "@/components/Skeleton";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import GuestPage from "@/components/GuestPage";
import { useToast } from "@/components/ui/use-toast";
import ListingItemWithRequests from "@/components/ListingItemWithRequests";
import ListingItemForSublets from "@/components/ListingItemForSublets";

const ACTIVE_STATUSES = [
    "pendingSubTenant",
    "pendingTenant",
    "pendingTenantUpload",
    "pendingSubTenantUpload",
    "pendingFinalAccept",
];
const PAST_STATUSES = ["rejected"];
const CONFIRMED_STATUSES = ["accepted", "confirmed"];

const Sublets = () => {
    // get user object from context
    const { user, loading } = useAuth();

    // for toast notifications
    const { toast } = useToast();

    // state
    const [activeTab, setActiveTab] = useState("active");
    const [listings, setListings] = useState([]);
    const [displayListings, setDisplayListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [fetching, setFetching] = useState(true);

    // fetch listings from DB
    useEffect(() => {
        // fetch listings
        const fetchLlistings = async () => {
            // had hardcoded filters for this API call taken from Explore page
            // but I removed them for now bc we weren't getting all the listings
            // if we need to add those filters back we always can. code is in Explore page
            const response = await fetch(`/api/listings`);

            // error handling
            if (!response.ok) {
                console.log(response);
                throw new Error("Failed to fetch listings");
            }

            // update state with listings, sorting them first
            const receivedListings = await response.json();
            setListings(
                receivedListings.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt))
            );
        };
        fetchLlistings();
    }, [user]);

    // fetch requests from DB
    useEffect(() => {
        // if no user we can't fetch their requests
        if (!user) return;

        // fetch requests
        const fetchRequests = async () => {
            const response = await fetch(`/api/requests/user-requests/${user.id}`);
            if (!response.ok) {
                console.log(response);
                throw new Error("Failed to fetch requests");
            }
            const data = await response.json();
            setRequests(data);
        };
        fetchRequests();
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
        return listings.filter((listing) => activeRequestListingIds.includes(listing._id));
    }, [listings]);
    const pastListings = useMemo(() => {
        return listings.filter((listing) => pastRequestListingIds.includes(listing._id));
    }, [listings]);
    const confirmedListings = useMemo(() => {
        return listings.filter((listing) => confirmedRequestListingIds.includes(listing._id));
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
    });

    // set fetching to false once listings and requests are fetched
    useEffect(() => {
        if (listings.length && requests.length) {
            setFetching(false);
        }
    }, [activeListings, pastListings, confirmedListings, listings, requests]);

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
        const updatedListings = listings.filter((listing) => listing.id !== listingId);
        setListings(updatedListings);
    };

    // this is to ensure we don't get any flashing of the Guest page or the "# of listings" text
    // only care about the "fetching" prop if user is signed in, otherwise won't be fetching anything
    if (loading || (user && fetching)) {
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
                {listings.length && requests.length ? (
                    <>
                        <p className="self-start mb-1 text-gray-700 text-sm">
                            {displayListings.length} listing{displayListings.length !== 1 && "s"}{" "}
                            with {activeTab} requests
                        </p>
                        <div className="grid grid-cols-1 gap-10 mt-2">
                            {displayListings.map((listing) => {
                                // get all requests for this listing
                                const listingRequests = requests.filter(
                                    (request) => request.listingId === listing._id
                                );

                                switch (activeTab) {
                                    case "past":
                                        const pastRequests = requests.filter(
                                            (request) =>
                                                PAST_STATUSES.includes(request.status) &&
                                                request.listingId === listing._id
                                        );
                                        return (
                                            <ListingItemWithRequests
                                                key={listing._id}
                                                listing={listing}
                                                requests={pastRequests}
                                                deleteListing={handleDeleteListing}
                                            />
                                        );
                                    case "active":
                                        const activeRequests = requests.filter(
                                            (request) =>
                                                ACTIVE_STATUSES.includes(request.status) &&
                                                request.listingId === listing._id
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
                                        const confirmedRequests = requests.filter(
                                            (request) =>
                                                CONFIRMED_STATUSES.includes(request.status) &&
                                                request.listingId === listing._id
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

                                // return activeTab === "past" ? (
                                //     <ListingItemWithRequests
                                //         key={listing._id}
                                //         listing={listing}
                                //         requests={listingRequests}
                                //         deleteListing={handleDeleteListing}
                                //     />
                                // ) : (
                                //     // <ListingItem key={listing.id} listing={listing} />
                                //     <ListingItemForSublets
                                //         key={listing._id}
                                //         listing={listing}
                                //         listingRequests={listingRequests}
                                //     />
                                // );
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
