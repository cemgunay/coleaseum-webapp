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
import { determineRoute } from "@/utils/determineRoute";
import { useToast } from "@/components/ui/use-toast";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";

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
        bedrooms: [],
        bathrooms: null,
    },
    // Additional details like title, description, pricing, and dates.
    title: "",
    description: "",
    published: false,
    draft: false,
    price: 100,
    priceChanged: false,
    moveInDate: null,
    moveOutDate: null,
    expiryDate: null,
    viewingDates: [],
};
const initialAmenitiesState = {};
const initialUtilitiesState = {};
const initialImagesState = [];

//base pathname for the context this will be given to
const PATHNAME_CREATE = "/host/create-listing/";
const PATHNAME_EDIT = "/host/manage-listings";

// Provider component for the ListingFormContext.
export const ListingFormProvider = ({ children }) => {
    // Retrieve the current user and initialize router for navigation.
    const { user, status } = useAuth();

    const router = useRouter();
    const { toast } = useToast();

    // Extract the listing ID from the URL, and check if the current route is part of the listing creation process or edit listing process.
    const { listingId } = router.query;
    const isCreateListingRoute = router.pathname.startsWith(PATHNAME_CREATE);
    const isEditListingRoute = router.pathname.startsWith(PATHNAME_EDIT);
    const currentRoute = router.pathname;

    // States to manage the loading and pushing (data submission) status.
    const [pushing, setPushing] = useState(false);
    // Additional state to handle routing loading
    const [isRouting, setIsRouting] = useState(true);
    // To check if user used the back button
    const [userBack, setUserBack] = useState(false);

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
        if (user) {
            listingDetailsDispatch({
                type: "UPDATE_USER_ID",
                payload: user.id,
            });
        }
    }, [user]);

    // Function to load data from the database based on the listing ID.
    const { data, error, isLoading, mutate } = useSWR(
        listingId ? `/api/listings/${listingId}` : null,
        fetcher
    );

    //check if user is authorized if not redirect, if so then load database data into listing state
    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            if (isCreateListingRoute || isEditListingRoute) {
                setIsRouting(true); // Set routing to true at the start

                if (listingId && status === "authenticated") {
                    if (data) {
                        // Check if authenticated user matches listing user
                        if (data.userId !== user.id) {
                            // Redirect the user to the 403 page
                            router.replace("/403").then(() => {
                                setIsRouting(false);
                            });
                            return;
                        }

                        // Load listing data into context
                        const {
                            utilities,
                            images,
                            amenities,
                            ...listingDetails
                        } = data;
                        const payload = {
                            listingDetails,
                            utilities,
                            images,
                            amenities,
                        };
                        combinedListingFormDispatch({
                            type: "LOAD_STATE",
                            payload: payload,
                        });

                        // to check if user manually entered a url
                        if (!userBack) {
                            // Determine the next step based on the data
                            const nextStep = determineRoute(data, currentRoute);
                            if (
                                nextStep &&
                                router.asPath !== nextStep &&
                                listingId
                            ) {
                                await router.replace(nextStep); // Wait for the routing to complete
                            }
                        }
                    }
                }
                setIsRouting(false); // Set routing to false at the end
            }
        };

        checkAuthAndLoadData();
    }, [
        listingId,
        status,
        data,
        isCreateListingRoute,
        isEditListingRoute,
        router,
        user,
    ]);

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

            const updatedListing = await response.json();

            if (!response.ok) {
                setPushing(false);
                throw new Error(updatedListing.error || "API call failed");
            }

            await mutate(); // Force revalidation of the listing data
            console.log("Listing updated:", updatedListing);

            // Check if nextPage is provided before navigating
            if (nextPage) {
                if (nextPage === "manage-listings") {
                    router.push("/host/manage-listings");
                } else {
                    router
                        .push(`/host/create-listing/${listingId}/${nextPage}`)
                        .then(() => {
                            setPushing(false);
                        });
                }
            } else {
                // If nextPage is not provided, just stop pushing without navigating
                setPushing(false);
                toast({
                    variant: "default",
                    title: "Updated!",
                    description: "Listing updated successfully",
                });
            }
        } catch (error) {
            console.error("Error updating listing:", error);
            setPushing(false);
            toast({
                variant: "destructive",
                title: "Failed to update listing :(",
                description: error.message,
            });
        }
    };

    // Combined loading state for the UI
    const isLoadingCombined = isLoading || isRouting;

    return (
        <ListingFormContext.Provider
            value={{
                listingId,
                combinedListingFormState,
                combinedListingFormDispatch,
                isLoading: isLoadingCombined,
                setPushing,
                pushToDatabase,
                pushing,
                setUserBack,
            }}
        >
            {children}
        </ListingFormContext.Provider>
    );
};
