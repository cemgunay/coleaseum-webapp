import React from "react";

import { FaBolt } from "react-icons/fa";
import { FaWifi } from "react-icons/fa6";
import { IoWater } from "react-icons/io5";

const UtilitiesCard = ({ utility }) => {
    const utilitiesInfo = {
        // isn't electricity the same as hydro?
        electricity: {
            icon: <FaBolt className="text-2xl" />,
            name: "Electricity",
        },
        hydro: {
            icon: <FaBolt className="text-2xl" />,
            name: "Hydro",
        },
        water: { icon: <IoWater className="text-2xl" />, name: "Water" },
        wifi: { icon: <FaWifi className="text-2xl" />, name: "WiFi" },
    };

    return (
        <div className="flex flex-col gap-1 items-center shadow-md rounded-md h-full w-fit p-2 border border-gray-400">
            <div>{utilitiesInfo[utility].icon}</div>
            <div>{utilitiesInfo[utility].name}</div>
        </div>
    );
};

const UtilitiesDisplay = ({ utilities }) => {
    // filter out utilities that are false
    const availableUtilities = Object.keys(utilities).filter((key) => utilities[key] === true);

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {availableUtilities.map((utility, idx) => (
                <UtilitiesCard key={idx} utility={utility} />
            ))}
        </div>
    );
};

export default UtilitiesDisplay;
