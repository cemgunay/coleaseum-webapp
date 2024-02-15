import React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export function DateRangePicker({ className, date, setDate }) {

    return (
        <div className={cn("grid gap-2", className)}>
            {/* Optional: Button or Text Display for Selected Dates */}
            <Button
                variant="outline"
                className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                    date.to ? (
                        <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y")
                    )
                ) : (
                    <span>Pick a date</span>
                )}
            </Button>

            {/* Calendar Component Always Visible */}
            <Calendar
                className={"text-xs"}
                classNames={{
                    // Other classNames
                    caption_label: "text-sm",
                    nav_button:
                        "h-5 w-5 ", // Smaller buttons
                    head_cell: "h-10 w-10 ",
                    cell: "h-10 w-10", // Smaller cells
                    day: "h-10 w-10", // Ensure days match cell size
                    // Adjust other relevant classes similarly
                }}
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
            />
        </div>
    );
}
