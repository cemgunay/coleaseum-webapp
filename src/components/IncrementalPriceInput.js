import React, { useState } from "react";
import { PiPlusCircleThin, PiMinusCircleThin } from "react-icons/pi";

const IncrementalPriceInput = ({ priceOffer, setPriceOffer }) => {
    // buttonClicked state. used to try to mitigate situation where when user
    // clicks on the buttons quickly, it selects the text in the input
    // doesn't work 100% of the time but reduces frequency of the issue
    // maybe we can find a more elegant solution later
    const [buttonClicked, setButtonClicked] = useState(false);

    // handler functions for incremental input
    const handleDecrementPrice = () => {
        setPriceOffer((prevPrice) => (prevPrice > 0 ? prevPrice - 25 : 0));
        setButtonClicked(true);
    };

    const handleIncrementPrice = () => {
        setPriceOffer((prevPrice) => prevPrice + 25);
        setButtonClicked(true);
    };

    return (
        <div className="w-full flex justify-center items-center gap-5">
            <PiMinusCircleThin
                onClick={handleDecrementPrice}
                className="text-4xl text-color-primary hover:cursor-pointer"
            />
            <input
                type="text"
                value={`$${priceOffer.toLocaleString()}`}
                onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setPriceOffer(parseInt(value, 10) || 0);
                }}
                onSelect={(e) => {
                    if (buttonClicked) {
                        e.preventDefault();
                        setButtonClicked(false);
                    }
                }}
                onClick={() => setButtonClicked(false)}
                className="text-slate-700 border rounded-md py-[2px] text-lg select-none w-28 text-center"
            />
            <PiPlusCircleThin
                onClick={handleIncrementPrice}
                className="text-4xl text-color-primary hover:cursor-pointer"
            />
        </div>
    );
};

export default IncrementalPriceInput;
