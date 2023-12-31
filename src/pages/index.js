import BottomNav from "@/components/BottomNav";
import ListingList from "@/components/ListingList";
import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import React from "react";

// const inter = Inter({ subsets: ["latin"] });

export default function Explore() {
    // const currentUser = null;
    const currentUser = {
        firstName: "Nathan",
    };

    const [listings, setListings] = useState([]);

    // fetch listings from DB
    useEffect(() => {
        const fetchLlistings = async () => {
            // hardcoded filters (I think)
            const filters = {
                price: [10, 10000],
                startDate: "2023-05-01",
                endDate: "2024-10-14",
            };

            // build a query string for the GET request
            const queryString = new URLSearchParams({
                filters: JSON.stringify(filters),
            }).toString();

            // call API endpoint to get filtered listings
            const response = await fetch(`/api/listings?${queryString}`);

            // error handling
            if (!response.ok) {
                console.log(response);
                throw new Error("API call failed :(");
            }

            // update state with listings, sorting them first
            const receivedListings = await response.json();
            // console.log(receivedListings);
            setListings(
                receivedListings.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt))
            );
        };
        fetchLlistings();
    }, []);

    // loading component
    const Loading = () => {
        return (
            <div className="flex flex-col items-start justify-start min-h-screen gap-3 mx-8 pt-8">
                <h1 className="font-bold text-3xl">All listings</h1>
                {currentUser ? <div>Welcome back {currentUser.firstName}</div> : null}
                <Skeleton className="w-1/6 h-5 mb-6" />
                {[...Array(3)].map((_, i) => (
                    <React.Fragment key={i}>
                        <Skeleton key={`skeleton1-${i}`} className="w-full h-52" />
                        <Skeleton key={`skeleton2-${i}`} className="w-1/6 h-5" />
                        <Skeleton key={`skeleton3-${i}`} className="w-1/2 h-5" />
                        <div className="flex justify-between w-full h-5 mb-7">
                            <Skeleton key={`skeleton4-${i}`} className="w-1/3" />
                            <Skeleton key={`skeleton5-${i}`} className="w-1/4" />
                        </div>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // show loading page until listings are successfully retrieved
    if (!listings.length) {
        return (
            <>
                <Loading />
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <main className="m-[2rem] min-h-screen flex flex-col gap-2">
                <h1 className="font-bold text-3xl">All listings</h1>
                {currentUser ? <div>Welcome back {currentUser.firstName}</div> : null}
                <p>{listings.length} listings</p>
                <ListingList listings={listings} />
            </main>
            <BottomNav />
        </>
    );
}
