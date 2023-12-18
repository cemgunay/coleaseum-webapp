import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const YearPicker = ({ selectedYear, setSelectedYear }) => {
    const years = Array.from(
        { length: 100 },
        (_, i) => new Date().getFullYear() - i
    );

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

const MonthPicker = ({ selectedMonth, setSelectedMonth }) => {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return (
        <Select
            onValueChange={(value) => setSelectedMonth(months.indexOf(value))}
        >
            <SelectTrigger>
                <SelectValue placeholder={months[selectedMonth]} />
            </SelectTrigger>
            <SelectContent>
                {months.map((month) => (
                    <SelectItem key={month} value={month}>
                        {month}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

const DatePickerMovingDates = ({
    date,
    setDate,
    minDate,
    maxDate,
    className,
}) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [popoverDisplayDate, setPopoverDisplayDate] = useState(new Date());
    //state to control Popover visibility
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    console.log(minDate)

    const handleYearChange = (year) => {
        setSelectedYear(year);
        if (date) {
            const newDate = new Date(year, date.getMonth(), date.getDate());
            setDate(newDate);
            setPopoverDisplayDate(newDate);
        } else {
            setPopoverDisplayDate(
                new Date(year, popoverDisplayDate.getMonth())
            );
        }
    };

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
        if (date) {
            const newDate = new Date(date.getFullYear(), month, date.getDate());
            setDate(newDate);
            setPopoverDisplayDate(newDate);
        } else {
            setPopoverDisplayDate(
                new Date(popoverDisplayDate.getFullYear(), month)
            );
        }
    };

    //handleDateSelect now checks propertyToUpdate and handles it different if its an array such as viewingDates
    const handleDateSelect = (date) => {
        setDate(date);
        setIsPopoverOpen(false);
    };

    return (
        <Popover
            side="bottom"
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
        >
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full h-11 justify-start text-left font-normal border-slate-300",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex flex-col items-center">
                <div className="flex gap-2 p-2">
                    <YearPicker
                        selectedYear={selectedYear}
                        setSelectedYear={handleYearChange}
                    />
                    <MonthPicker
                        selectedMonth={selectedMonth}
                        setSelectedMonth={handleMonthChange}
                    />
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    displayDate={popoverDisplayDate}
                    setDisplayDate={setPopoverDisplayDate}
                    disabled={{ before: minDate, after: maxDate }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

export default DatePickerMovingDates;
