import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function DateFlexibilityToggle({ dateFlexibility, setDateFlexibility }) {
    const handleFlexibilityChange = (value) => {
        setDateFlexibility(value);
    };

    return (
        <ToggleGroup
            size={"xs"}
            type="single"
            value={dateFlexibility}
            onValueChange={handleFlexibilityChange}
        >
            <ToggleGroupItem
                size={"xs"}
                className={"text-xs p-1"}
                variant={"outline"}
                value="exact"
                aria-label="Exact dates"
            >
                Exact Dates
            </ToggleGroupItem>
            <ToggleGroupItem
                size={"xs"}
                className={"text-xs p-1"}
                variant={"outline"}
                value="1day"
                aria-label="Plus or minus 1 day"
            >
                ±1 Day
            </ToggleGroupItem>
            <ToggleGroupItem
                size={"xs"}
                className={"text-xs p-1"}
                variant={"outline"}
                value="2days"
                aria-label="Plus or minus 2 days"
            >
                ±2 Days
            </ToggleGroupItem>
            <ToggleGroupItem
                size={"xs"}
                className={"text-xs p-1"}
                variant={"outline"}
                value="3days"
                aria-label="Plus or minus 3 days"
            >
                ±3 Days
            </ToggleGroupItem>
            <ToggleGroupItem
                size={"xs"}
                className={"text-xs p-1"}
                variant={"outline"}
                value="5days"
                aria-label="Plus or minus 5 days"
            >
                ±5 Days
            </ToggleGroupItem>
        </ToggleGroup>
    );
}
