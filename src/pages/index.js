import BottomNav from "@/components/BottomNav";
import { useCallback, useEffect, useState } from "react";
import Skeleton from "@/components/Skeleton";
import React from "react";
import { ExploreSearchMenu } from "@/components/ExploreSearchMenu";
import { useRouter } from "next/router";
import ExploreMap from "@/components/ExploreMap";
import { useLoadScript } from "@react-google-maps/api";
import ListingsLayout from "@/components/ListingsLayout";
import ExploreSearchBar from "@/components/ExploreSearchBar";
import ExploreFilter from "@/components/ExploreFilter";

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

    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);

    const resetSelectedMarker = useCallback(() => {
        setSelectedMarkerIndex(null);
    }, []);

    useEffect(() => {
        if (openSearch) {
            resetSelectedMarker();
        }
    }, [openSearch]);

    // Update the URL when filters change
    const handleFiltersChange = (newFilters) => {
        const { query } = router;

        router.push(
            {
                pathname: router.pathname,
                query: { ...query, ...newFilters },
            },
            undefined,
            { shallow: true }
        );
    };

    return (
        <>
            <header className="fixed top-0 px-4 z-50 w-full bg-white flex justify-between items-center h-20 pointer-events-auto">
                <ExploreSearchBar setOpenSearch={setOpenSearch} />
                <ExploreFilter resetSelectedMarker={resetSelectedMarker} />
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
                    resetSelectedMarker={resetSelectedMarker}
                />
                <ExploreMap
                    isLoaded={isLoaded}
                    selectedMarkerIndex={selectedMarkerIndex}
                    setSelectedMarkerIndex={setSelectedMarkerIndex}
                    resetSelectedMarker={resetSelectedMarker}
                />
                <ListingsLayout snap={snap} setSnap={setSnap} />
            </main>
            {snap > 0.7 ? <BottomNav /> : null}
        </>
    );
}
