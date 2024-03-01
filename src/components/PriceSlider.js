import { Slider } from "./ui/slider";
import Input from "./Input";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const PriceSlider = ({
    sliderRange,
    setSliderRange,
    maxPrice,
    handleCommit,
}) => {
    // New state hooks for the input display values
    const [startInputValue, setStartInputValue] = useState(sliderRange[0]);
    const [endInputValue, setEndInputValue] = useState(sliderRange[1]);

    const router = useRouter();
    const { isReady, query } = router;

    // Ensure sliderRange is updated if maxPrice changes
    useEffect(() => {
        if (isReady) {
            if (query.priceMin && query.priceMax) {
                setSliderRange([query.priceMin, query.priceMax]);
                setStartInputValue(query.priceMin);
                setEndInputValue(query.priceMax);
            } else {
                setSliderRange([0, maxPrice]);
                setStartInputValue(0);
                setEndInputValue(maxPrice.toString());
            }
        }
    }, [maxPrice]);

    // Handle range changes
    const handleSliderChange = (value) => {
        setSliderRange(value);

        // Update input field values based on slider change
        setStartInputValue(value[0].toString());
        setEndInputValue(value[1].toString());
    };

    const handleSliderCommit = (value) => {
        setSliderRange(value);

        // Update input field values based on slider change
        setStartInputValue(value[0].toString());
        setEndInputValue(value[1].toString());

        handleCommit(value);
    };

    const handleStartInputChange = (e) => {
        const value = e.target.value;
        setStartInputValue(value); // Update the start input display value directly

        setSliderRange((prevRange) => {
            let newStart = value === "" ? 0 : parseInt(value, 10);
            let newEnd = prevRange[1];

            if (isNaN(newStart) || newStart >= newEnd) {
                newStart = newEnd - 5;
            }

            return [newStart, newEnd];
        });
    };

    const handleEndInputChange = (e) => {
        let value = e.target.value;
        let numericValue = parseInt(value, 10);

        // Ensure the value does not exceed the maxPrice
        if (numericValue > maxPrice) {
            numericValue = maxPrice;
            value = maxPrice.toString(); // Set the input value to the max allowed
        }

        setEndInputValue(value); // Update the display value

        setSliderRange((prevRange) => {
            let newStart = prevRange[0];
            let newEnd = numericValue;

            // Ensure newEnd is not less than newStart and does not exceed the maximum
            if (isNaN(newEnd) || newEnd <= newStart) {
                newEnd = Math.max(newStart + 5, maxPrice);
            }

            return [newStart, Math.min(newEnd, maxPrice)];
        });
    };

    const handleBlur = (type) => {
        // Correct any invalid states when the user moves away from the input
        if (type === "start") {
            let start = parseInt(startInputValue, 10) || 0;
            start = Math.max(start, 0);
            setStartInputValue(start.toString());
        } else if (type === "end") {
            let end = parseInt(endInputValue, 10) || maxPrice;
            end = Math.min(end, maxPrice);
            setEndInputValue(end.toString());
        }

        const startValue = parseInt(startInputValue, 10) || 0;
        const endValue = parseInt(endInputValue, 10) || maxPrice;

        // Update slider range accordingly
        setSliderRange([startValue, endValue]);

        handleCommit([startValue, endValue]);
    };

    return (
        <>
            <Slider
                value={sliderRange}
                onValueChange={handleSliderChange}
                min={0}
                max={maxPrice}
                step={5}
                showLabel={false}
                minStepsBetweenThumbs={2}
                formatLabel={(value) => `$${value}`}
                onValueCommit={handleSliderCommit}
            />
            <div className="flex items-center justify-between mt-8">
                <Input
                    type="number"
                    value={startInputValue}
                    onChange={handleStartInputChange}
                    onBlur={handleBlur} // Add this to handle when the input loses focus
                    style={{ width: "48%", textAlign: "center" }}
                />
                <div className="flex justify-center items-center w-1/6">-</div>
                <Input
                    type="number"
                    value={endInputValue}
                    onChange={handleEndInputChange}
                    onBlur={handleBlur} // Add this to handle when the input loses focus
                    style={{ width: "48%", textAlign: "center" }}
                />
            </div>
        </>
    );
};

export default PriceSlider;
