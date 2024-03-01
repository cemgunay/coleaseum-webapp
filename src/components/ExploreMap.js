import {
    APIProvider,
    Map,
    useMap,
    AdvancedMarker,
} from "@vis.gl/react-google-maps";
import {
    MarkerClusterer,
    SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";
import { useEffect, useState, useRef, useMemo } from "react";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import { useRouter } from "next/router";
import { LinearProgress } from "@mui/material";
import { debounce } from "lodash";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import Skeleton from "./Skeleton";

function getSearchRadius(zoomLevel) {
    // Define constants for the function
    const maxZoom = 21; // Maximum zoom level where you might want the smallest radius
    const minRadius = 0.1; // Minimum search radius in km, at the highest zoom level
    const maxRadius = 50; // Maximum search radius in km, at the lowest zoom level

    // Calculate the factor by which the radius decreases with each zoom level increase
    const zoomFactor = Math.log(maxRadius / minRadius) / (maxZoom - 10);

    // Calculate the current radius based on the current zoom level
    let radius = maxRadius / Math.exp(zoomFactor * (zoomLevel - 10));

    // Ensure the radius is within bounds
    radius = Math.max(Math.min(radius, maxRadius), minRadius);

    return radius;
}

function calculateBoundsRadius(northEast, center) {
    // Haversine formula to calculate distance between two points on the Earth
    function haversineDistance(coords1, coords2) {
        function toRad(x) {
            return (x * Math.PI) / 180;
        }

        const R = 6371; // Earth radius in km
        const dLat = toRad(coords2.lat - coords1.lat);
        const dLon = toRad(coords2.lng - coords1.lng);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(coords1.lat)) *
                Math.cos(toRad(coords2.lat)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Calculate distance from the center to one of the corners (e.g., northeast)
    // This gives you an approximate radius of the bounds
    return haversineDistance(center, northEast);
}

export default function ExploreMap({
    isLoaded,
    selectedMarkerIndex,
    setSelectedMarkerIndex,
    resetSelectedMarker,
}) {
    const mapOptions = {
        disableDefaultUI: true,
    };

    const router = useRouter();
    const { query } = router;

    const [coords, setCoords] = useState(
        query.coords ? JSON.parse(query.coords) : null
    );
    const [radius, setRadius] = useState(
        query.radius ? parseFloat(query.radius) : null
    );
    const [zoom, setZoom] = useState(query.zoom ? parseInt(query.zoom) : 10);

    useEffect(() => {
        if (query.coords) {
            setCoords(JSON.parse(query.coords));
        }
        if (query.radius) {
            setRadius(parseFloat(query.radius));
        }
        if (query.zoom) {
            setZoom(parseInt(query.zoom));
        }
    }, [query]);

    const updateMapState = (newCenter, newSearchRadius, zoomLevel) => {
        router.push(
            {
                pathname: router.pathname,
                query: {
                    ...query,
                    coords: JSON.stringify(newCenter),
                    radius: newSearchRadius.toString(),
                    zoom: zoomLevel,
                },
            },
            undefined,
            { shallow: true }
        );
    };

    const Loading = () => {
        return <Skeleton className={"w-full h-full"} />;
    };

    if (!coords || !zoom || !isLoaded) {
        return <Loading />;
    }

    return (
        <div className="w-full h-full relative">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <Map
                    center={coords}
                    zoom={zoom}
                    mapId="3b6263e9ed3a60cf"
                    options={mapOptions}
                >
                    <Markers
                        coords={coords}
                        radius={radius}
                        setSelectedMarkerIndex={setSelectedMarkerIndex}
                        resetSelectedMarker={resetSelectedMarker}
                        selectedMarkerIndex={selectedMarkerIndex}
                    />
                    <MapEventListener
                        updateMapState={updateMapState}
                        resetSelectedMarker={resetSelectedMarker}
                    />
                </Map>
            </APIProvider>
        </div>
    );
}

const MapEventListener = ({ updateMapState, resetSelectedMarker }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const handleMapUpdates = debounce(() => {
            const bounds = map.getBounds();
            const boundsFormatted = {
                northEast: bounds.getNorthEast().toJSON(),
                southWest: bounds.getSouthWest().toJSON(),
            };
            const center = map.getCenter().toJSON();
            const zoomLevel = map.getZoom();
            const boundsRadius = calculateBoundsRadius(
                boundsFormatted.northEast,
                boundsFormatted.southWest,
                center
            );
            const searchRadius = Math.min(
                getSearchRadius(zoomLevel),
                boundsRadius
            );

            // Update map state with the new center and search radius
            updateMapState(center, searchRadius, zoomLevel);

            // Optionally, reset the selected marker if needed
            resetSelectedMarker();
        }, 300);

        // Attach listeners
        google.maps.event.addListener(map, "dragend", handleMapUpdates);
        google.maps.event.addListener(map, "zoom_changed", handleMapUpdates);

        // Cleanup
        return () => {
            google.maps.event.clearListeners(map, "dragend");
            google.maps.event.clearListeners(map, "zoom_changed");
        };
    }, [map, updateMapState, resetSelectedMarker]);

    return null; // This component does not render anything
};

const Markers = ({
    selectedMarkerIndex,
    setSelectedMarkerIndex,
    resetSelectedMarker,
}) => {
    const map = useMap();
    const [markers, setMarkers] = useState({});
    const clusterer = useRef(null);
    const [markerZIndex, setMarkerZIndex] = useState(0);

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
            bathrooms: query.bathrooms
        }),
        [query]
    );

    const queryString = useMemo(() => {
        const filtersStr = encodeURIComponent(JSON.stringify(initialFilters));
        return `filters=${filtersStr}`;
    }, [query]);

    const { data: listings, isLoading } = useSWR(
        [`/api/listings?${queryString}`, "ExploreMap"],
        ([url, component]) => fetcher(url, component),
        {
            keepPreviousData: true,
        }
    );

    // A function to slightly adjust marker positions
    const getAdjustedPosition = (location, index) => {
        const offset = 0.0001; // Adjust this value based on your needs
        return {
            lat:
                location.lat +
                offset * Math.sin((index * 2 * Math.PI) / listings.length),
            lng:
                location.lng +
                offset * Math.cos((index * 2 * Math.PI) / listings.length),
        };
    };

    useEffect(() => {
        if (!map) return;

        // Ensure clusterer is only initialized once
        if (!clusterer.current) {
            const algorithm = new SuperClusterAlgorithm({ maxZoom: 15 });

            // Initialize MarkerClusterer with maxZoom option
            clusterer.current = new MarkerClusterer({
                map,
                algorithm,
            });
        }
    }, [map]);

    useEffect(() => {
        clusterer.current?.clearMarkers();
        clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]);

    const setMarkerRef = (marker, key) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;

        setMarkers((prev) => {
            if (marker) {
                return { ...prev, [key]: marker };
            } else {
                const newMarkers = { ...prev };
                delete newMarkers[key];
                return newMarkers;
            }
        });
    };

    const handleMarkerClick = (index) => {
        setSelectedMarkerIndex(index);
        // Increment zIndex for the newly clicked marker
        setMarkerZIndex((prevZIndex) => prevZIndex + 1);
    };

    const Loading = () => {
        return <LinearProgress />;
    };

    if (!listings || isLoading) {
        return <Loading />;
    }

    return (
        <>
            {isLoading || !listings ? <Loading /> : null}
            {listings.map((listing, index) => (
                <AdvancedMarker
                    position={getAdjustedPosition(listing.location, index)}
                    key={listing._id}
                    ref={(marker) => setMarkerRef(marker, listing._id)}
                    onClick={() => handleMarkerClick(index)}
                    zIndex={
                        selectedMarkerIndex === index ? markerZIndex : undefined
                    }
                >
                    {/* Customize marker content as needed */}
                    <div className="text bg-white p-2 rounded-lg shadow-md">
                        ${listing.price}
                    </div>
                </AdvancedMarker>
            ))}
            {selectedMarkerIndex !== null && (
                <DetailsPane
                    listing={listings[selectedMarkerIndex]}
                    router={router}
                    resetSelectedMarker={resetSelectedMarker}
                />
            )}
        </>
    );
};

const DetailsPane = ({ listing, router, resetSelectedMarker }) => {
    return (
        <div className="absolute bottom-40 w-full">
            <div className="m-4 bg-white rounded-xl shadow-lg flex gap-2">
                <div className="relative w-2/5 h-32 overflow-hidden">
                    <Image
                        src={listing.images[0].cloudinaryUrl}
                        fill={true}
                        alt="Picture of listing"
                        className="rounded-l-xl object-cover"
                    />
                    <div
                        className="m-2 absolute top-0 left-0"
                        onClick={() => resetSelectedMarker()}
                    >
                        <IoClose className="text-lg" />
                    </div>
                </div>

                <div
                    className="flex flex-col justify-between py-2"
                    onClick={() => router.push(`/listing/${listing._id}`)}
                >
                    <h3 className="text-lg">{listing.title}</h3>
                    <p className="text-sm">{listing.description}</p>
                    <p className="font-bold">${listing.price}</p>
                </div>
            </div>
        </div>
    );
};
