import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import React from "react";
import { ExploreSearchMenu } from "@/components/ExploreSearchMenu";
import { useRouter } from "next/router";
import ExploreMap from "@/components/ExploreMap";
import { useLoadScript } from "@react-google-maps/api";
import ListingsLayout from "@/components/ListingsLayout";
import { IoFilterCircleOutline } from "react-icons/io5";
import { format } from "date-fns";
import ExploreSearchBar from "@/components/ExploreSearchBar";

//need places library to be able to use autocomplete functions
const libraries = ["places"];

// const inter = Inter({ subsets: ["latin"] });

export default function Explore() {
    const router = useRouter();
    //google maps api load script
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    //state variables
    const [openSearch, setOpenSearch] = useState(false);

    const [snap, setSnap] = useState(0.01);

    // Update the URL when filters change
    const handleFiltersChange = (newFilters) => {
        router.push(
            {
                pathname: router.pathname,
                query: { ...newFilters },
            },
            undefined,
            { shallow: true }
        );
    };

    // loading component
    const Loading = () => {
        return (
            <div className="flex flex-col items-start justify-start min-h-screen gap-3 mx-8 pt-8">
                <Skeleton className="w-full h-10" />
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
    if (!isLoaded) {
        return (
            <>
                <Loading />
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <header className="fixed top-0 px-4 z-50 w-full bg-white flex justify-between items-center h-20 pointer-events-auto">
                <ExploreSearchBar setOpenSearch={setOpenSearch} />
                <IoFilterCircleOutline className="text-4xl" />
            </header>
            <main
                className={`mt-20 h-screen flex flex-col gap-2 ${
                    snap === 0.01 ? "pointer-events-auto" : ""
                }`}
            >
                <ExploreSearchMenu
                    isOpen={openSearch}
                    onClose={() => setOpenSearch(false)}
                    onFiltersChange={handleFiltersChange}
                />
                <ExploreMap />
                <ListingsLayout snap={snap} setSnap={setSnap} />
            </main>
            {snap > 0.7 ? <BottomNav /> : null}
        </>
    );
}
