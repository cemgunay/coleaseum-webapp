import { parseISO } from "date-fns";

//function to validate that the date provided is a date object and if not parse it
export default function getValidDate(dateInput) {
    if (typeof dateInput === "string") {
        // Parse the string to a Date object
        return parseISO(dateInput);
    } else if (dateInput instanceof Date) {
        // It's already a Date object
        return dateInput;
    } else {
        // Default case if dateInput is neither a string nor a Date object
        return new Date();
    }
}
