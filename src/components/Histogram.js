import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import Rectangle from "./Rectangle";

const MARGIN = { top: 30, right: 0, bottom: 0, left: 0 };
const BUCKET_PADDING = 0;

const Histogram = ({ width, height, sliderRange, prices }) => {
    const axesRef = useRef();

    const boundsWidth = width - MARGIN.right - MARGIN.left;
    const boundsHeight = height - MARGIN.top - MARGIN.bottom;

    const domain = [0, d3.max(prices)]; // Slightly extend the domain

    const calculateDynamicWidth = (prices) => {
        const sortedPrices = prices.sort(d3.ascending);
        const q1 = d3.quantile(sortedPrices, 0.25);
        const q3 = d3.quantile(sortedPrices, 0.75);
        const iqr = q3 - q1; // Interquartile range
        return iqr / Math.sqrt(prices.length); // Example formula for dynamic width
    };

    const bucketWidth = calculateDynamicWidth(prices);
    //const bucketWidth = 10; // Would be $10

    const maxPrice = d3.max(prices); // Assuming filteredPrices is your data after outlier removal
    const thresholds = d3.range(0, maxPrice + bucketWidth, bucketWidth); // Creates thresholds up to and including the max price

    const xScale = useMemo(() => {
        return d3.scaleLinear().domain(domain).range([10, boundsWidth]);
    }, [prices, width]);

    const buckets = useMemo(() => {
        const bucketGenerator = d3
            .bin()
            .value((d) => d)
            .domain([0, maxPrice]) // Ensure the domain covers from 0 to maxPrice
            .thresholds(thresholds); // Use the calculated thresholds
        return bucketGenerator(prices);
    }, [prices]);

    const yScale = useMemo(() => {
        const max = Math.max(...buckets.map((bucket) => bucket?.length));
        return d3
            .scaleLinear()
            .range([boundsHeight, 0])
            .domain([0, max])
            .nice();
    }, [buckets, height]);

    // Render the X axis using d3.js, not react
    useEffect(() => {
        const svgElement = d3.select(axesRef.current);
        svgElement.selectAll("*").remove();

        const xAxisGenerator = d3
            .axisBottom(xScale)
            .tickFormat(d3.format("~s"))
            .tickSize(0);
        svgElement
            .append("g")
            .attr("transform", "translate(0," + boundsHeight + ")")
            .call(xAxisGenerator);
    }, [xScale, boundsHeight]);

    const allRects = buckets.map((bucket, i) => {
        const { x0, x1 } = bucket;
        if (x0 === undefined || x1 === undefined) {
            return null;
        }

        // Adjust width calculation for the last bucket
        let adjustedWidth = xScale(x1) - xScale(x0) - BUCKET_PADDING;
        if (i === buckets.length - 1) {
            adjustedWidth = Math.min(adjustedWidth, boundsWidth - xScale(x0));
        }

        const isWithinSliderRange =
            x1 <= sliderRange[1] && x0 >= sliderRange[0];

        return (
            <Rectangle
                key={i}
                x={xScale(x0) + BUCKET_PADDING / 2}
                width={adjustedWidth} // Use the adjusted width here
                y={yScale(bucket.length)}
                height={boundsHeight - yScale(bucket.length)}
                greyedOut={!isWithinSliderRange}
            />
        );
    });

    return (
        <>
            <svg width={width} height={height}>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(
                        ","
                    )})`}
                >
                    {allRects}
                </g>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    ref={axesRef}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(
                        ","
                    )})`}
                />
            </svg>
        </>
    );
};

export default Histogram;
