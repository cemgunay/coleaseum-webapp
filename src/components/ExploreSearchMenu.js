import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
} from "@/components/ui/sheet";
import { DateRangePicker } from "./DateRangePicker";
import { DateFlexibilityToggle } from "./DateFlexibilityToggle";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import AutocompleteField from "./AutocompleteField";
import { useRouter } from "next/router";

function getSearchRadius(zoomLevel) {
    // Define constants for the function
    const maxZoom = 21; // Maximum zoom level where you might want the smallest radius
    const minRadius = 0.1; // Minimum search radius in km, at the highest zoom level
    const maxRadius = 50; // Maximum search radius in km, at the lowest zoom level

    // Calculate the factor by which the radius decreases with each zoom level increase
    const zoomFactor = Math.log(maxRadius / minRadius) / (maxZoom - 10);

    // Calculate the current radius based on the current zoom level
    let radius = maxRadius / Math.exp(zoomFactor * (zoomLevel - 10));

    // Ensure the radius is within bounds
    radius = Math.max(Math.min(radius, maxRadius), minRadius);

    return radius;
}

export function ExploreSearchMenu({ isOpen, onClose, onFiltersChange }) {
    const router = useRouter();
    const { query } = router;

    const [startDate, setStartDate] = useState(
        query.from ? new Date(query.from) : ""
    );
    const [endDate, setEndDate] = useState(query.to ? new Date(query.to) : "");

    const [selectedDates, setSelectedDates] = useState(
        startDate && endDate
            ? {
                  from: startDate,
                  to: endDate,
              }
            : ""
    );

    const [selectedLocation, setSelectedLocation] = useState(
        query.location ? query.location : ""
    );

    const [coords, setCoords] = useState(
        query.coords ? JSON.parse(query.coords) : null
    );

    const [zoom, setZoom] = useState(
        query.coords ? parseFloat(query.zoom) : null
    );

    const [dateFlexibility, setDateFlexibility] = useState("exact"); // Options: 'exact', '1day', '2days', '3days', '5days'

    //update from query params
    useEffect(() => {
        if (query.location) {
            setSelectedLocation(query.location);
        }
        if (query.coords) {
            setCoords(JSON.parse(query.coords));
        }
        if (query.zoom) {
            setZoom(parseFloat(query.zoom));
        }
        if (query.from) {
            setStartDate(new Date(query.from));
        }
        if (query.to) {
            setEndDate(new Date(query.to));
        }
    }, [query]);

    const [openAccordionItem, setOpenAccordionItem] = useState("");

    // Function to handle address selection from Autocomplete component
    const handleAddressSelect = async (locationData) => {
        // Split the description by commas and take the first part as the name
        const name = locationData.name.split(",")[0];

        setSelectedLocation(name);
        setCoords({ lat: locationData.lat, lng: locationData.lng });
        setZoom(locationData.zoomLevel);

        setOpenAccordionItem(null); // Close the accordion
    };

    const handleSave = async () => {
        // Function to add or subtract days from a date
        const adjustDate = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() - days);
            return result;
        };

        // Calculate the adjusted dates based on dateFlexibility
        let adjustedFrom = selectedDates.from;
        let adjustedTo = selectedDates.to;

        // Map flexibility options to a number of days to adjust
        const flexibilityDaysMap = {
            "1day": 1,
            "2days": 2,
            "3days": 3,
            "5days": 5,
            exact: 0, // No adjustment needed
        };

        // Adjust the start and end dates if flexibility is not 'exact'
        if (dateFlexibility !== "exact") {
            const days = flexibilityDaysMap[dateFlexibility];
            adjustedFrom = adjustDate(adjustedFrom, -days); // Subtract days from start date
            adjustedTo = adjustDate(adjustedTo, days); // Add days to end date
        }

        // Use the adjusted dates in the filters
        onFiltersChange({
            location: selectedLocation ? selectedLocation : "",
            coords: coords ? JSON.stringify(coords) : null, // Stringify coords for URL compatibility
            zoom: zoom,
            radius: getSearchRadius(zoom),
            from: adjustedFrom ? adjustedFrom.toISOString() : "", // Convert to ISO string for consistency
            to: adjustedTo ? adjustedTo.toISOString() : "",
        });

        setOpenAccordionItem(null); // Close the accordion
        onClose(); // Close the menu after saving changes
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent
                    side={"top"}
                    className={"overflow-y-scroll max-h-screen"}
                >
                    <Accordion
                        className="flex flex-col gap-4 py-8"
                        type="single"
                        collapsible
                        value={openAccordionItem} // Control which item is open
                        onValueChange={setOpenAccordionItem} // Update state when accordion changes
                    >
                        <AccordionItem value="item-1">
                            <AccordionTrigger
                                selectedLocation={selectedLocation}
                                label={"Select Location"}
                            >
                                Location
                            </AccordionTrigger>
                            <AccordionContent>
                                <AutocompleteField
                                    onAddressSelect={handleAddressSelect}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger
                                selectedDates={selectedDates}
                                label={"Select Dates"}
                            >
                                Dates
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4">
                                <DateRangePicker
                                    date={selectedDates}
                                    setDate={setSelectedDates}
                                    className="w-full max-w-xs mx-auto"
                                />
                                <DateFlexibilityToggle
                                    dateFlexibility={dateFlexibility}
                                    setDateFlexibility={setDateFlexibility}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button onClick={handleSave}>Save changes</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
