import BottomNav from "@/components/BottomNav";
import ListingList from "@/components/ListingList";
import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import React from "react";
import { useAuth } from "@/hooks/useAuth";

// const inter = Inter({ subsets: ["latin"] });

export default function Explore() {
    //get context user from hook
    const { user: contextUser } = useAuth();

    // state for user object that will be fetched from db
    const [user, setUser] = useState(null);

    // other state
    const [error, setError] = useState(null);

    // fetch user data if user is logged in (i.e. contextUser is not null)
    useEffect(() => {
        // do nothing if user is not logged in
        if (!contextUser) return;

        // fetch user
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${contextUser?.id}`);
                if (!response.ok) {
                    const error = await response.json().error;
                    setError(`Error ${response.status}: ${error}`);
                    return;
                }
                const data = await response.json();
                setUser(data);
                // console.log(data);
            } catch (error) {
                setError(error.message ? error.message : error);
            }
        };
        fetchUser();
    }, [contextUser]);

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
                receivedListings.sort(
                    (p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt)
                )
            );
        };
        fetchLlistings();
    }, []);

    // loading component
    const Loading = () => {
        return (
            <div className="flex flex-col items-start justify-start min-h-screen gap-3 mx-8 pt-8">
                <h1 className="font-bold text-3xl">All listings</h1>
                {user ? (
                    <>
                        {/* display error if there is one */}
                        {error && (
                            <div className="w-full p-4 -mb-3 -mt-5 text-center text-lg text-red-500">
                                <p>{error}</p>
                            </div>
                        )}
                        <div>Welcome back {user.firstName}</div>
                    </>
                ) : null}
                <Skeleton className="w-1/6 h-5 mb-6" />
                {[...Array(3)].map((_, i) => (
                    <React.Fragment key={i}>
                        <Skeleton
                            key={`skeleton1-${i}`}
                            className="w-full h-52"
                        />
                        <Skeleton
                            key={`skeleton2-${i}`}
                            className="w-1/6 h-5"
                        />
                        <Skeleton
                            key={`skeleton3-${i}`}
                            className="w-1/2 h-5"
                        />
                        <div className="flex justify-between w-full h-5 mb-7">
                            <Skeleton
                                key={`skeleton4-${i}`}
                                className="w-1/3"
                            />
                            <Skeleton
                                key={`skeleton5-${i}`}
                                className="w-1/4"
                            />
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
                {user ? <div>Welcome back {user.firstName}</div> : null}
                <p>{listings.length} listings</p>
                <ListingList listings={listings} />
            </main>
            <BottomNav />
        </>
    );
}
