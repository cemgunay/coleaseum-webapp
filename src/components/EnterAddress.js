import React from "react";
import AutocompleteField from "@/components/AutocompleteField";
import GoogleMap from "@/components/Map";
import Skeleton from "./Skeleton";

const EnterAddress = ({
    handleSubmit,
    onAddressSelect,
    isLoaded,
    loadError,
    position,
    formatLocationData,
}) => {

    const LoadingField = () => {
        return <Skeleton className="h-14 w-1/2 mb-2" />;
    };
    
    const LoadingMap = () => {
        return <Skeleton className="h-screen w-full mb-2" />;
    };
    
    return (
        <>
            <div className="flex items-center">
                <div className="flex flex-col justify-between items-start text-sm">
                    <div>Where's your place located?</div>
                    {!isLoaded ? (
                        <LoadingField />
                    ) : (
                        <>
                            <AutocompleteField
                                onAddressSelect={onAddressSelect}
                                formatLocationData={formatLocationData}
                            />
                            <div onClick={handleSubmit}>Enter manually</div>
                        </>
                    )}
                </div>
            </div>
            {!isLoaded ? (
                <LoadingMap />
            ) : (
                <GoogleMap
                    position={position}
                    isLoaded={isLoaded}
                    loadError={loadError}
                />
            )}
        </>
    );
};

export default EnterAddress;
