import React from "react";
import BedroomCard from "./BedroomCard";

const BedroomsDisplay = ({ bedrooms }) => {
    return (
        <div className="flex gap-3 mt-4 mb-2">
            {bedrooms.map((bedroom, idx) => (
                <BedroomCard key={idx} title={`Bedroom ${idx + 1}`} type={bedroom.bedType} />
            ))}
        </div>
    );
};

export default BedroomsDisplay;
