import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// function to merge tailwind classes
// super useful in like custom components where we wanna set base styling but
// also allow for custom styling
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// function to set a timeout on fetch requests
// aborts fetch if it takes longer than "timeout" milliseconds
export async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
    }).catch((error) => {
        clearTimeout(id);
        return { error: true, message: error.message };
    });

    clearTimeout(id);
    return response;
}

// helper function to format price (so it has dollar sign, commas, and 2 decimal places)
export function formatPrice(price, addDecimalPlaces = true) {
    if (addDecimalPlaces) {
        return `$${price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    } else {
        return `$${price.toLocaleString()}`;
    }
}

// helper function to capitalize first letter of a string
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
