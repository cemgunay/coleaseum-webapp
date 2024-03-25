import React, { useRef } from "react";
import Histogram from "./Histogram"; // Assuming your Histogram component is in this file
import { useDimensions } from "@/hooks/useDimensions";

const HistogramWrapper = ({ sliderRange, prices }) => {
    const wrapperRef = useRef(null);
    const { width, height } = useDimensions(wrapperRef);

    return (
        <div ref={wrapperRef} className="w-full h-36">
            {width > 0 && height > 0 && (
                <Histogram
                    width={width}
                    height={height}
                    sliderRange={sliderRange}
                    prices={prices}
                />
            )}
        </div>
    );
};

export default HistogramWrapper;
