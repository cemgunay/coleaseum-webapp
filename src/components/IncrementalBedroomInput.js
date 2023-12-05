import React from "react";
import { PiPlusCircleThin, PiMinusCircleThin } from "react-icons/pi";

const IncrementalBedroomInput = ({
    bedrooms,
    numberOfBedrooms,
    dispatch,
}) => {
    const handleDecrement = () => {
        if (numberOfBedrooms > 0) {
            const newBedrooms = bedrooms.slice(0, -1);

            dispatch({
                type: "UPDATE_BASICS",
                payload: { bedrooms: newBedrooms },
            });
        }
    };

    const handleIncrement = () => {
        dispatch({
            type: "UPDATE_BASICS",
            payload: {
                bedrooms: [...bedrooms, { bedType: [], ensuite: false }],
            },
        });
    };

    return (
        <div className="flex justify-center items-center gap-4">
            <PiMinusCircleThin
                onClick={handleDecrement}
                className="text-2xl text-color-primary hover:cursor-pointer"
            />
            <div className="select-none w-6 text-center">
                {numberOfBedrooms.toLocaleString()}
            </div>
            <PiPlusCircleThin
                onClick={handleIncrement}
                className="text-2xl text-color-primary hover:cursor-pointer"
            />
        </div>
    );
};

export default IncrementalBedroomInput;
