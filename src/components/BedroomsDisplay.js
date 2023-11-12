import React from "react";
import { IoBed } from "react-icons/io5";

const BedroomCard = ({ title, type }) => {
    return (
        <div className="flex flex-col items-start rounded-md shadow-md h-full w-[120px] p-3 border border-gray-400">
            <IoBed className="text-2xl self-center mb-2" />
            <h1 className="font-semibold text-lg">{title}</h1>
            {/* <div className="h-[1px] bg-gray-400 w-full" /> */}
            <p className="text-base">{`${type} bed`}</p>
        </div>
    );
};

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
