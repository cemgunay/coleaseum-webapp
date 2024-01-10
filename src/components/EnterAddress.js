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

    return (
        <div className="mx-8 flex flex-col justify-between gap-4 flex-grow h-full">
            <div className="flex flex-col justify-between items-start text-lg gap-4">
                <div>Where's your place located?</div>
                <AutocompleteField
                    onAddressSelect={onAddressSelect}
                    formatLocationData={formatLocationData}
                />
                <div onClick={handleSubmit} className="text-sm underline">
                    Enter manually
                </div>
            </div>
            <div className="flex-grow mb-4">
                <GoogleMap
                    position={position}
                    isLoaded={isLoaded}
                    loadError={loadError}
                />
            </div>
        </div>
    );
};

export default EnterAddress;
