import React from "react";
import { PiPlusCircleThin, PiMinusCircleThin } from "react-icons/pi";

const IncrementalBedroomInput = ({ bedrooms, numberOfBedrooms, dispatch, setBedrooms }) => {
    // decrement the number of bedrooms by 1
    const handleDecrement = () => {
        if (numberOfBedrooms > 0) {
            const newBedrooms = bedrooms.slice(0, -1);

            if (dispatch) {
                dispatch({
                    type: "UPDATE_BASICS",
                    payload: { bedrooms: newBedrooms },
                });
            } else {
                setBedrooms((prevState) => ({
                    ...prevState,
                    bedrooms: newBedrooms,
                }));
            }
        }
    };

    // increment the number of bedrooms by 1
    const handleIncrement = () => {
        if (dispatch) {
            dispatch({
                type: "UPDATE_BASICS",
                payload: {
                    bedrooms: [...bedrooms, { bedType: [], ensuite: false }],
                },
            });
        } else {
            setBedrooms((prevState) => ({
                ...prevState,
                bedrooms: [...prevState.bedrooms, { bedType: [], ensuite: false }],
            }));
        }
    };

    return (
        <div className="flex justify-center items-center gap-4">
            <PiMinusCircleThin
                onClick={handleDecrement}
                className="text-4xl text-color-primary hover:cursor-pointer"
            />
            <div className="select-none w-6 text-xl text-center">
                {numberOfBedrooms.toLocaleString()}
            </div>
            <PiPlusCircleThin
                onClick={handleIncrement}
                className="text-4xl text-color-primary hover:cursor-pointer"
            />
        </div>
    );
};

export default IncrementalBedroomInput;
