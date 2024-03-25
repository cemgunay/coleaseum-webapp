import React, { useEffect, useMemo } from "react";
import ListingList from "./ListingList";
import { useRouter } from "next/router";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import Skeleton from "./Skeleton";
import { Drawer, DrawerContent } from "./ui/drawer";
import { Button } from "./ui/button";

export default function ListingsLayout({ snap, setSnap }) {
    return (
        <Drawer
            open={true}
            dismissible={false}
            snapPoints={[0.01, 0.3, 0.9]} // Ensure lowest snap point keeps drawer open
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
        >
            <DrawerContent>
                <DrawerBody
                    activeSnapPoint={snap}
                    setActiveSnapPoint={setSnap}
                />
            </DrawerContent>
        </Drawer>
    );
}

const DrawerBody = ({ activeSnapPoint, setActiveSnapPoint }) => {
    const router = useRouter();
    const { query } = router; // Access query params directly from the router

    // Use the query parameters as initial filters or defaults if not specified
    const initialFilters = useMemo(
        () => ({
            startDate: query.startDate,
            endDate: query.endDate,
            location: query.location,
            coords: query.coords && JSON.parse(query.coords),
            radius: query.radius,
            privacyType: query.privacyType,
            priceMin: query.priceMin,
            priceMax: query.priceMax,
            bedrooms: query.bedrooms,
            bathrooms: query.bathrooms,
        }),
        [query]
    );

    // Fetch data using SWR based on URL parameters
    const queryString = new URLSearchParams({
        filters: JSON.stringify(initialFilters),
    }).toString();
    const { data, isLoading, isValidating, error } = useSWR(
        `/api/listings?${queryString}`,
        fetcher
    );

    // Transform data after fetching
    const listings = data
        ? [...data].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        : null;

    useEffect(() => {
        if (!initialFilters.coords) {
            setActiveSnapPoint(0.9);
        }
    }, [initialFilters]);

    // Define a loading component to be shown inside the drawer
    const LoadingComponent = ({ activeSnapPoint }) => (
        <div data-vaul-no-drag className="mt-4">
            {activeSnapPoint < 0.7 && (
                <div className="my-5 w-full flex flex-col items-center">
                    <Skeleton className={"h-5 w-28"} />
                </div>
            )}

            {activeSnapPoint > 0.1 ? (
                <div className="flex flex-col items-start justify-start gap-3 mx-8 h-screen overflow-y-auto no-scrollbar">
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
            ) : null}
        </div>
    );

    return (
        <>
            {isLoading || !data || isValidating ? (
                <LoadingComponent activeSnapPoint={activeSnapPoint} />
            ) : (
                <div
                    data-vaul-no-drag
                    className="mt-2 mx-4 flex flex-col gap-2 items-center"
                >
                    <div
                        data-vaul-no-drag
                        className={`flex justify-between items-center ${
                            activeSnapPoint > 0.7 ? "w-full" : ""
                        } `}
                    >
                        {activeSnapPoint < 0.7 && (
                            <div data-vaul-no-drag>
                                {listings.length} Listings
                            </div>
                        )}

                        {activeSnapPoint > 0.7 && initialFilters.coords ? (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => setActiveSnapPoint(0.01)}
                            >
                                map view
                            </Button>
                        ) : null}
                    </div>
                    <div
                        data-vaul-no-drag
                        className="h-screen overflow-y-auto no-scrollbar"
                    >
                        <ListingList listings={listings} />
                    </div>
                </div>
            )}
        </>
    );
};
