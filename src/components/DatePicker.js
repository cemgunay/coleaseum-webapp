import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const YearPicker = ({ selectedYear, setSelectedYear }) => {
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    return (
        <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
        >
            {years.map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
            ))}
        </select>
    );
};

const YearPicker2 = ({ selectedYear, setSelectedYear }) => {
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    return (
        <Select onValueChange={(value) => setSelectedYear(parseInt(value, 10))}>
            <SelectTrigger>
                <SelectValue placeholder={selectedYear} />
            </SelectTrigger>
            <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

const DatePicker = () => {
    const [date, setDate] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [popoverDisplayDate, setPopoverDisplayDate] = useState(new Date());

    const handleYearChange = (year) => {
        setSelectedYear(year);
        if (date) {
            const newDate = new Date(year, date.getMonth(), date.getDate());
            setDate(newDate);
            setPopoverDisplayDate(newDate);
        } else {
            setPopoverDisplayDate(new Date(year, popoverDisplayDate.getMonth()));
        }
    };

    const handleDateSelect = (date) => {
        // just a temp function for now so I can console log the chosen date
        console.log(date);
        setDate(date);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full h-11 justify-start text-left font-normal border-slate-300",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-col items-center">
                <div className="p-2">
                    <YearPicker2 selectedYear={selectedYear} setSelectedYear={handleYearChange} />
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    // onSelect={setDate}
                    onSelect={handleDateSelect}
                    displayDate={popoverDisplayDate}
                    setDisplayDate={setPopoverDisplayDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

export default DatePicker;
