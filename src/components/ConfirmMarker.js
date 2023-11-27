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
    const Loading = () => {
        return <Skeleton className="h-screen w-full mb-2" />;
    };

    return (
        <>
            {!isLoaded ? (
                <Loading />
            ) : (
                <>
                    <GoogleMap
                        position={position}
                        isLoaded={isLoaded}
                        loadError={loadError}
                        combinedListingFormDispatch={
                            combinedListingFormDispatch
                        }
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <MdLocationOn className="text-color-primary text-4xl" />
                    </div>
                </>
            )}
        </>
    );
};

export default ConfirmMarker;
