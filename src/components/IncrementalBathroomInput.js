import React from "react";
import { PiPlusCircleThin, PiMinusCircleThin } from "react-icons/pi";

const IncrementalBedroomInput = ({ bathrooms, dispatch }) => {
    // set the current number of bathrooms
    const currentBathrooms = bathrooms === null ? 0 : bathrooms;

    // decrement the number of bathrooms by 1
    const handleDecrement = () => {
        if (currentBathrooms > 0) {
            dispatch({
                type: "UPDATE_BASICS",
                payload: { bathrooms: currentBathrooms - 1 },
            });
        }
    };

    // increment the number of bathrooms by 1
    const handleIncrement = () => {
        dispatch({
            type: "UPDATE_BASICS",
            payload: {
                bathrooms: currentBathrooms + 1,
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
                {currentBathrooms.toLocaleString()}
            </div>
            <PiPlusCircleThin
                onClick={handleIncrement}
                className="text-2xl text-color-primary hover:cursor-pointer"
            />
        </div>
    );
};

export default IncrementalBedroomInput;
