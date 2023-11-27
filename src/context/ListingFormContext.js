// Import necessary React hooks and components.
import { useAuth } from "@/hooks/useAuth";
import React, { createContext, useState, useEffect, useReducer } from "react";
import {
    listingDetailsReducer,
    amenitiesReducer,
    utilitiesReducer,
    imagesReducer,
} from "@/reducers";
import { useRouter } from "next/router";

// Create a context for the listing form.
export const ListingFormContext = createContext();

// Define initial states for different parts of the listing form.
const initialListingDetailsState = {
    // User ID and details about the place.
    userId: "",
    aboutYourPlace: {
        propertyType: "",
        privacyType: "",
    },
    // Location details.
    location: {
        address1: "",
        city: "",
        countryregion: "",
        postalcode: "",
        stateprovince: "",
        unitnumber: "",
        lat: null,
        lng: null,
    },
    // Basic details like bedrooms and bathrooms.
    basics: {
        bedrooms: [
            {
                bedType: [],
                ensuite: false,
            },
        ],
        bathrooms: null,
    },
    // Additional details like title, description, pricing, and dates.
    title: "",
    description: "",
    published: false,
    price: null,
    moveInDate: null,
    moveOutDate: null,
    expiryDate: null,
    viewingDates: [],
};
const initialAmenitiesState = {};
const initialUtilitiesState = {};
const initialImagesState = [];

const PATHNAME = "/host/create-listing/";

// Provider component for the ListingFormContext.
export const ListingFormProvider = ({ children }) => {
    // Retrieve the current user and initialize router for navigation.
    const { user: contextUser } = useAuth();
    const router = useRouter();

    // Extract the listing ID from the URL, and check if the current route is part of the listing creation process.
    const { listingId }= router.query
    const isCreateListingRoute = router.pathname.startsWith(PATHNAME);

    // States to manage the loading and pushing (data submission) status.
    const [isLoading, setIsLoading] = useState(true);
    const [pushing, setPushing] = useState(false);

    // Reducers for managing different aspects of the listing form.
    const [listingDetailsState, listingDetailsDispatch] = useReducer(
        listingDetailsReducer,
        initialListingDetailsState
    );
    const [amenitiesState, amenitiesDispatch] = useReducer(
        amenitiesReducer,
        initialAmenitiesState
    );
    const [utilitiesState, utilitiesDispatch] = useReducer(
        utilitiesReducer,
        initialUtilitiesState
    );
    const [imagesState, imagesDispatch] = useReducer(
        imagesReducer,
        initialImagesState
    );

    // Combine states for a consolidated view of the form state.
    const combinedListingFormState = {
        ...listingDetailsState,
        amenities: amenitiesState,
        utilities: utilitiesState,
        images: imagesState,
    };

    // Combined dispatch function to update states from all reducers.
    const combinedListingFormDispatch = (action) => {
        listingDetailsDispatch(action);
        amenitiesDispatch(action);
        utilitiesDispatch(action);
        imagesDispatch(action);
    };

    // Update the user ID in the listing details when the context user changes.
    useEffect(() => {
        if (contextUser) {
            listingDetailsDispatch({
                type: "UPDATE_USER_ID",
                payload: contextUser.id,
            });
        }
    }, [contextUser]);

    // Function to load data from the database based on the listing ID.
    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/listings/${listingId}`);

            // Handle different response statuses and navigate to appropriate pages.
            if (!response.ok) {
                if (response.status === 404) {
                    router.push("/404"); // Navigate to 404 page on not found error.
                    return;
                } else if (response.status === 500) {
                    router.push("/500"); // Navigate to 500 page on server error.
                    return;
                }
                throw new Error(
                    `API call failed with status ${response.status}`
                );
            }

            const data = await response.json();

            // Prepare the payload to update states with fetched data.
            const { utilities, images, amenities, ...listingDetails } = data;
            const payload = {
                listingDetails,
                utilities,
                images,
                amenities,
            };

            // Dispatch action to update all parts of the form state.
            combinedListingFormDispatch({
                type: "LOAD_STATE",
                payload: payload,
            });
        } catch (error) {
            console.error("Error loading form data:", error);
            // TODO: Implement error handling with user notifications.
        }
        setIsLoading(false);
    };

    // Effect to load data when the listing ID changes or when navigating between pages.
    useEffect(() => {
        if (isCreateListingRoute && listingId) {
            loadData();
        }
    }, [isCreateListingRoute, listingId]);

    // Function to push data to the database and navigate to the next form page.
    const pushToDatabase = async (listingId, updateData, nextPage) => {
        setPushing(true);
        try {
            const response = await fetch(`/api/listings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ listingId, updateData }),
            });

            if (!response.ok) {
                setPushing(false);
                throw new Error("API call failed");
            }

            const updatedListing = await response.json();
            console.log("Listing updated:", updatedListing);

            // Navigate to the next page after successful submission.
            router
                .push(`/host/create-listing/${listingId}/${nextPage}`)
                .then(() => {
                    setPushing(false);
                });
        } catch (error) {
            console.error("Error updating listing:", error);
            setPushing(false);
            // TODO: Implement error handling with user notifications.
        }
    };

    return (
        <ListingFormContext.Provider
            value={{
                listingId,
                combinedListingFormState,
                combinedListingFormDispatch,
                isLoading,
                setPushing,
                pushToDatabase,
                pushing,
            }}
        >
            {children}
        </ListingFormContext.Provider>
    );
};
