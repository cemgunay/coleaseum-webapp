import React, { useEffect, useMemo, useState } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { IoFilterCircleOutline, IoFilterCircle } from "react-icons/io5";
import TypeFilter from "./TypeFilter";
import PriceSlider from "./PriceSlider";
import FilterRoomsAndBeds from "./FilterRoomsAndBeds";
import { X } from "lucide-react";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import { useRouter } from "next/router";
import * as d3 from "d3";
import HistogramWrapper from "./HistogramWrapper";
import Skeleton from "./Skeleton";
import { CircularProgress } from "@mui/material";

const ExploreFilter = ({ resetSelectedMarker }) => {
    const router = useRouter();
    const { isReady, query } = router;
    const [initialFilters, setInitialFilters] = useState(null);
    const [filters, setFilters] = useState(null);

    // Initial slider range state is set to null or [0, 0] as a placeholder
    const [sliderRange, setSliderRange] = useState([0, 0]);

    //for beds and etc.
    const bedrooms = useMemo(
        () => (filters?.bedrooms ? filters.bedrooms : "any"),
        [filters]
    );
    const bathrooms = useMemo(
        () => (filters?.bathrooms ? filters.bathrooms : "any"),
        [filters]
    );

    useEffect(() => {
        if (isReady) {
            const {
                startDate,
                endDate,
                location,
                coords,
                radius,
                privacyType,
            } = query;

            //This is solely for the histogram basically

            // Set initialFilters based on the extracted parameters
            // Ensure to convert types as necessary, e.g., parse JSON strings or convert string to numbers
            const extractedFilters = {
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(location && { location }),
                ...(coords && { coords: JSON.parse(coords) }),
                ...(radius && { radius: parseFloat(radius) }),
                ...(privacyType && { privacyType }),
            };

            // Update initialFilters state with the extracted filters
            setInitialFilters(extractedFilters);

            // If priceMin and priceMax are in the query, update the slider range
            if (query.priceMin && query.priceMax) {
                setSliderRange([
                    parseInt(query.priceMin, 10),
                    parseInt(query.priceMax, 10),
                ]);
            }

            setFilters({
                ...query,
                ...(coords && { coords: JSON.parse(coords) }),
            });
        }
    }, [isReady, query]);

    const updateInitialFilters = (newFilters) => {
        setInitialFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const updateFilters = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // function to update price
    const updatePrice = (newRange) => {
        updateFilters({ priceMin: newRange[0], priceMax: newRange[1] });
    };

    // function to update the type filter
    const handleTypeChange = (newType) => {
        updateInitialFilters({ privacyType: newType });
        updateFilters({ privacyType: newType });
    };

    const handleBedroomChange = (newNumberOfBedrooms) => {
        updateFilters({ bedrooms: newNumberOfBedrooms });
    };
    const handleBathroomChange = (newNumberOfBathrooms) => {
        updateFilters({ bathrooms: newNumberOfBathrooms });
    };

    const queryStringInitialFilters = useMemo(() => {
        // Stringify the filters object
        if (initialFilters) {
            const filtersStr = encodeURIComponent(
                JSON.stringify(initialFilters)
            );
            return `filters=${filtersStr}`;
        } else {
            return null;
        }
    }, [initialFilters]);

    const { data, isLoading, error } = useSWR(
        queryStringInitialFilters &&
            `/api/listings?${queryStringInitialFilters}`,
        fetcher,
        { keepPreviousData: true }
    );

    const queryStringFilters = useMemo(() => {
        // Stringify the filters object
        if (filters) {
            const filtersStr = encodeURIComponent(JSON.stringify(filters));
            return `filters=${filtersStr}`;
        } else {
            return null;
        }
    }, [filters]);

    const { data: listingsCount, isLoading: isLoadingCount } = useSWR(
        queryStringFilters && `/api/listings?${queryStringFilters}`,
        fetcher
    );

    // Transform data after fetching
    const listings = data
        ? [...data].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        : null;

    // Extract prices from listings
    const prices = useMemo(() => {
        if (data) {
            return data.map((listing) => listing.price);
        }
        return []; // Return an empty array if there's no data
    }, [data]);

    // Filter out extreme outliers for visualization purposes
    const filteredPrices = useMemo(() => {
        const sortedPrices = [...prices].sort((a, b) => a - b);
        const q1 = d3.quantile(sortedPrices, 0.25);
        const q3 = d3.quantile(sortedPrices, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        return sortedPrices.filter(
            (price) => price >= lowerBound && price <= upperBound
        );
    }, [prices]);

    // Dynamically update slider range based on prices
    useEffect(() => {
        if (isReady) {
            if (filteredPrices.length > 0 && !query.priceMax) {
                const maxPrice = Math.max(...filteredPrices);
                setSliderRange([0, maxPrice]);
            }
        }
    }, [filteredPrices, isReady]);

    const maxPrice = useMemo(
        () => Math.max(...filteredPrices),
        [filteredPrices]
    );

    // Calculate the number of applied filters
    const appliedFiltersCount = useMemo(() => {
        let count = 0;
        if (filters?.priceMin && filters?.priceMax) count++;
        if (filters?.privacyType && filters?.privacyType !== "any") count++;
        if (filters?.bedrooms && filters?.bedrooms !== "any") count++;
        if (filters?.bathrooms && filters?.bathrooms !== "any") count++;
        return count;
    }, [filters]);

    const handleSubmit = () => {
        // Prepare updated query parameters
        const { privacyType, priceMin, priceMax } = filters; // Destructure the properties you're interested in

        const updatedQuery = {
            ...query, // Add or overwrite with the current filters
            ...(privacyType !== undefined && { privacyType }),
            ...(priceMin !== undefined && { priceMin }),
            ...(priceMax !== undefined && { priceMax }),
            ...(bedrooms !== undefined && { bedrooms }),
            ...(bathrooms !== undefined && { bathrooms }),
            // Ensure complex objects like `coords` are appropriately serialized
            // coords: filters.coords ? JSON.stringify(filters.coords) : null,
        };

        // Update the URL without navigating away
        router
            .push(
                {
                    pathname: router.pathname, // Use the current pathname
                    query: updatedQuery, // Use the updated query parameters
                },
                undefined,
                { shallow: true } // Enable shallow routing
            )
            .then(resetSelectedMarker());
    };

    const handleClear = () => {
        // Create a new query object excluding the properties you want to clear
        const {
            privacyType,
            priceMin,
            priceMax,
            bedrooms,
            bathrooms,
            ...remainingQuery
        } = query;

        // Update the URL without the cleared parameters
        router
            .push(
                {
                    pathname: router.pathname,
                    query: remainingQuery, // Use the updated query parameters
                },
                undefined,
                { shallow: true } // Enable shallow routing
            )
            .then(() => {
                resetSelectedMarker(); // Ensure this function is called correctly in the promise resolution
            });
    };

    const Loading = () => {
        return (
            <div>
                <Skeleton className={"w-4 h-4"} />
            </div>
        );
    };

    if (!initialFilters || !filters || !isReady) {
        return <Loading />;
    }

    return (
        <Sheet>
            <SheetTrigger>
                <div className="relative">
                    {appliedFiltersCount > 0 ? (
                        <IoFilterCircle className="text-4xl" />
                    ) : (
                        <IoFilterCircleOutline className="text-4xl" />
                    )}
                    {appliedFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {appliedFiltersCount}
                        </span>
                    )}
                </div>
            </SheetTrigger>
            <SheetContent
                side="top"
                showCloseButton={false}
                className="flex flex-col gap-0 max-h-screen"
            >
                <SheetHeader className="sticky top-0 z-10 border-b-2 grid grid-cols-3 pb-2 space-y-0 bg-white">
                    <SheetClose>
                        <X className="h-4 w-4" />
                    </SheetClose>
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                {/* Main content goes here, it will scroll as needed */}
                <div className="flex flex-col gap-4 pt-4 flex-1 overflow-y-auto no-scrollbar">
                    <TypeFilter
                        onTypeChange={handleTypeChange}
                        initialType={
                            initialFilters.privacyType
                                ? initialFilters.privacyType
                                : "any"
                        }
                    />
                    <div className="flex flex-col gap-4 pb-4 border-b-2">
                        <div className="font-bold">Price</div>
                        <div className="flex flex-col gap-0">
                            {!listings || !isReady ? (
                                <Skeleton className={"w-full h-36"} />
                            ) : (
                                <div>
                                    <HistogramWrapper
                                        sliderRange={sliderRange}
                                        prices={filteredPrices}
                                    />
                                    <PriceSlider
                                        sliderRange={sliderRange}
                                        setSliderRange={setSliderRange}
                                        maxPrice={maxPrice}
                                        handleCommit={updatePrice}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <FilterRoomsAndBeds
                        selectedBedrooms={bedrooms}
                        onBedroomsChange={handleBedroomChange}
                        selectedBathrooms={bathrooms}
                        onBathroomsChange={handleBathroomChange}
                    />
                </div>

                <SheetFooter className="sticky bottom-0 z-10 mt-4 bg-white">
                    <SheetClose className="flex justify-between">
                        <div
                            className="w-1/4 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            onClick={handleClear}
                        >
                            Clear
                        </div>
                        <div
                            className="w-1/2 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handleSubmit}
                        >
                            {!listingsCount || isLoadingCount ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                `Show ${listingsCount.length} listings`
                            )}
                        </div>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default ExploreFilter;
