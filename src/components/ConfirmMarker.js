import React from "react";
import GoogleMap from "@/components/Map";
import { MdLocationOn } from "react-icons/md";
import Skeleton from "./Skeleton";

const ConfirmMarker = ({
    position,
    isLoaded,
    loadError,
    combinedListingFormDispatch,
}) => {
    return (
        <div className="h-full mx-8">
            <div className="h-full flex flex-col justify-between pb-4 gap-4">
                <div className="text-lg">Is the pin in the right spot?</div>
                <GoogleMap
                    position={position}
                    isLoaded={isLoaded}
                    loadError={loadError}
                    combinedListingFormDispatch={combinedListingFormDispatch}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <MdLocationOn className="text-color-primary text-4xl" />
                </div>
            </div>
        </div>
    );
};

export default ConfirmMarker;
