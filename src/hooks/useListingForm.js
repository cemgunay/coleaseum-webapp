import { ListingFormContext } from "@/context/ListingFormContext";
import { useContext } from "react";

export const useListingForm = () => {
    return useContext(ListingFormContext);
};
