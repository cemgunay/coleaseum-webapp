import { useAuth } from "@/hooks/useAuth";
import React, { createContext, useState, useEffect, useReducer } from "react";
import {
    listingDetailsReducer,
    amenitiesReducer,
    utilitiesReducer,
    imagesReducer,
} from "@/reducers";

export const ListingFormContext = createContext();

//initial data states
const initialListingDetailsState = {
    userId: "",
    aboutYourPlace: {
        propertyType: "",
        privacyType: "",
    },
    location: {
        address1: "",
        city: "",
        countryregion: "",
        postalcode: "",
        stateprovince: "",
        unitnumber: "",
        lat: "",
        lng: "",
    },
    basics: {
        bedrooms: [
            {
                bedType: [],
                ensuite: false,
            },
        ],
        bathrooms: 0,
    },
    title: "",
    description: "",
    published: false,
    price: 0,
    moveInDate: null,
    moveOutDate: null,
    expiryDate: null,
    viewingDates: [],
};
const initialAmenitiesState = {};
const initialUtilitiesState = {};
const initialImagesState = [];

export const ListingFormProvider = ({ children }) => {
    // user ID making the listing used to initialize userId of listing
    const { user: contextUser } = useAuth();
    // helpful to update the UI accordingly
    const [loading, setLoading] = useState(true);
    // Separate Reducers for each part of the form
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

    // Combine states for easy access
    const combinedListingFormState = {
        listingDetails: listingDetailsState,
        amenities: amenitiesState,
        utilities: utilitiesState,
        images: imagesState,
    };

    // Dispatch action to all reducers
    // Combined for ease since all reducers have seperate action names they will correctly be ignored
    const combinedListingFormDispatch = (action) => {
        listingDetailsDispatch(action);
        amenitiesDispatch(action);
        utilitiesDispatch(action);
        imagesDispatch(action);
    };

    //update userId in listingDetails
    useEffect(() => {
        console.log('running here')
        if (contextUser) {
            listingDetailsDispatch({
                type: "UPDATE_USER_ID",
                payload: contextUser.id,
            });
        }
    }, [contextUser]);

    
    //pull from local storage when navigating between pages
    useEffect(() => {
        const storedState = localStorage.getItem("listingFormData");
        if (storedState) {
            combinedListingFormDispatch({
                type: "LOAD_STATE",
                payload: JSON.parse(storedState),
            });
        }
        setLoading(false)
    }, []);

    // Push to local storage on state change
    useEffect(() => {
        localStorage.setItem(
            "listingFormData",
            JSON.stringify(combinedListingFormState)
        );
    }, [combinedListingFormState]);
    
    console.log(combinedListingFormState)

    return (
        <ListingFormContext.Provider
            value={{ combinedListingFormState, combinedListingFormDispatch, loading }}
        >
            {children}
        </ListingFormContext.Provider>
    );
};
