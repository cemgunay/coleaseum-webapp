import React from "react";

import { BiSolidWasher, BiSolidDog, BiDumbbell } from "react-icons/bi";
import { BsThermometerSnow } from "react-icons/bs";
import { FaCouch, FaParking } from "react-icons/fa";
import { GiKnifeFork } from "react-icons/gi";
import { MdBalcony } from "react-icons/md";

const AmenitiesCard = ({ amenity }) => {
    const amenitiesInfo = {
        inUnitWasherAndDrier: {
            icon: <BiSolidWasher className="text-2xl" />,
            name: "Washer/Dryer",
        },
        airConditioning: {
            icon: <BsThermometerSnow className="text-2xl" />,
            name: "Air Cond.",
        },
        petsAllowed: { icon: <BiSolidDog className="text-2xl" />, name: "Pets Allowed" },
        furnished: { icon: <FaCouch className="text-2xl" />, name: "Furnished" },
        dishwasher: { icon: <GiKnifeFork className="text-xl" />, name: "Dishwasher" },
        fitnessCenter: { icon: <BiDumbbell className="text-2xl" />, name: "Fitness Center" },
        balcony: { icon: <MdBalcony className="text-2xl" />, name: "Balcony" },
        parking: { icon: <FaParking className="text-2xl" />, name: "Parking" },
    };

    return (
        <div className="flex flex-col gap-1 items-center shadow-md rounded-md h-full w-fit p-2 border border-gray-400">
            <div>{amenitiesInfo[amenity].icon}</div>
            <div>{amenitiesInfo[amenity].name}</div>
        </div>
    );
};

const Amenities = ({ amenities }) => {
    // filter out amenities that are false
    const availableAmenities = Object.keys(amenities).filter((key) => amenities[key] === true);
    console.log(availableAmenities);

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {availableAmenities.map((amenity, idx) => (
                <AmenitiesCard key={idx} amenity={amenity} />
            ))}
        </div>
    );
};

export default Amenities;
