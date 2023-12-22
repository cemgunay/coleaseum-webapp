import React, { useState, useMemo, useEffect } from "react";
import SubletsTabs from "@/components/SubletsTabs";
import Skeleton from "@/components/Skeleton";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import GuestPage from "@/components/GuestPage";
import ListingItemForHostSublets from "@/components/ListingItemForHostSublets";

const HostSublets = () => {
    // get user object from context
    const { user, loading } = useAuth();

    // state
    const [activeTab, setActiveTab] = useState("active");
    const [activeListings, setActiveListings] = useState([]);
    const [pastListings, setPastListings] = useState([]);
    const [confirmedListings, setConfirmedListings] = useState([]);

    const [displayListings, setDisplayListings] = useState([]);
    // const [requests, setRequests] = useState([]);
    const [fetching, setFetching] = useState(true);

    // fetch listings and requests from DB
    useEffect(() => {
        const fetchListingsAndRequests = async () => {
            // if no user we can't fetch their requests
            if (!user) return;

            // fetch all requests and all published/expired/booked listings for the user
            // API routes now attach requests to listings, so we only need to fetch listings
            const responseListingsPublished = await fetch(`/api/listings/published/${user.id}`);
            const responseListingsExpired = await fetch(`/api/listings/expired/${user.id}`);
            const responseListingsBooked = await fetch(`/api/listings/booked/${user.id}`);

            // error handling
            if (!responseListingsPublished.ok) {
                console.log("Error fetching published listings: ", responseListingsPublished);
                throw new Error("Failed to fetch published listings");
            }
            if (!responseListingsExpired.ok) {
                console.log("Error fetching expired listings: ", responseListingsExpired);
                throw new Error("Failed to fetch expired listings");
            }
            if (!responseListingsBooked.ok) {
                console.log("Error fetching booked listings: ", responseListingsBooked);
                throw new Error("Failed to fetch booked listings");
            }

            const receivedListingsPublished = await responseListingsPublished.json();
            const receivedListingsExpired = await responseListingsExpired.json();
            const receivedListingsBooked = await responseListingsBooked.json();

            setActiveListings(receivedListingsPublished);
            console.log(receivedListingsPublished);
            setPastListings(receivedListingsExpired);
            setConfirmedListings(receivedListingsBooked);
            setFetching(false);
        };

        fetchListingsAndRequests();
    }, [user]);

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
    }, [activeTab, fetching]);

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

    // // function to remove a listing from the list if all of its requests are deleted
    // // unused for now but will implement soon
    // const handleDeleteListing = async (listingId) => {
    //     // update listings state
    //     const updatedListings = listings.filter((listing) => listing.id !== listingId);
    //     setListings(updatedListings);
    // };

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
                {(activeListings.length || pastListings.length || confirmedListings.length) &&
                !fetching ? (
                    <>
                        <p className="self-start mb-1 text-gray-700 text-sm">
                            {displayListings.length} listing{displayListings.length !== 1 && "s"}{" "}
                            with {activeTab} requests
                        </p>
                        <div className="grid grid-cols-1 gap-10 mt-2">
                            {displayListings.map((listing) => {
                                return (
                                    <ListingItemForHostSublets
                                        key={listing._id}
                                        listing={listing}
                                        requests={listing.requests}
                                        activeTab={activeTab}
                                    />
                                );
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

export default HostSublets;
