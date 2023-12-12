import React, { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { CircularProgress } from "@mui/material";
import AuthInput from "@/components/AuthInput";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";

// Validate the postal code or zip code using the regex pattern for Confirm Address
const validatePostalCode = (postalCode) => {
    if (!postalCode) {
        return "Postal Code or Zip Code is required";
    }
    const re = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$|^\d{5}(?:[-\s]\d{4})?$/;

    return re.test(postalCode) ? null : "Invalid Postal Code or Zip Code";
};

//validate any required fields for Confirm Address
const validateRequired = (value, name) => {
    if (!value) {
        return `${name} is required`;
    }
    return null;
};

//helper function to format the address receieved from usePlacesAutocomplete
const formatLocationData = (address) => {
    const addressComponents = address.address_components;

    let unitnumber = "";
    let address1 = "";
    let city = "";
    let countryregion = "";
    let postalcode = "";
    let stateprovince = "";

    // Extracting components from address_components
    addressComponents.forEach((component) => {
        if (component.types.includes("subpremise")) {
            unitnumber += component.long_name;
        }
        if (component.types.includes("street_number")) {
            address1 += component.long_name + " ";
        }
        if (component.types.includes("route")) {
            address1 += component.long_name;
        }
        if (component.types.includes("locality")) {
            city = component.long_name;
        }
        if (component.types.includes("country")) {
            countryregion = component.long_name;
        }
        if (component.types.includes("postal_code")) {
            postalcode = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
            stateprovince = component.long_name;
        }
    });

    return {
        unitnumber,
        address1,
        city,
        countryregion,
        postalcode,
        stateprovince,
    };
};

// Function to check if there are any errors in the errors object
const hasErrors = (errors) => {
    return Object.values(errors).some((error) => error);
};

const EditLocation = ({ listing, dispatch, pushToDatabase, pushing }) => {
    //editing state variable
    const [isEditing, setIsEditing] = useState(false);
    const [editedLocation, setEditedLocation] = useState(listing.location);

    // format address string from location info
    const { address1, city, stateprovince } = editedLocation;
    const formattedAddressForDisplay = `${address1}, ${city}, ${stateprovince}`;
    const formattedAddress = useMemo(() => {
        // Handle optional unitnumber
        const unit = editedLocation.unitnumber
            ? `${editedLocation.unitnumber}, `
            : "";
        return `${unit}${editedLocation.address1}, ${editedLocation.city}, ${editedLocation.stateprovince} ${editedLocation.postalcode}, ${editedLocation.countryregion}`;
    }, [editedLocation]);

    // for help with checking users address and returning suggested address
    const [incorrectAddress, setIncorrectAddress] = useState(false);
    const [partialAddress, setPartialAddress] = useState("");
    const [partialAddressComponents, setPartialAddressComponents] =
        useState("");
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);

    //for form errors and if they have been touched
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        address1: false,
        unitnumber: false,
        city: false,
        stateprovince: false,
        postalcode: false,
        countryregion: false,
    });

    // initialize usePlacesAutocomplete
    const {
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete();

    // function to validate when user leaves an input field
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    // function to choose appropriate validation function
    const validate = (name, value) => {
        switch (name) {
            case "address1":
                return validateRequired(value, "Address");
            case "city":
                return validateRequired(value, "City");
            case "countryregion":
                return validateRequired(value, "Country");
            case "postalcode":
                return validatePostalCode(value);
            case "stateprovince":
                return validateRequired(value, "State/Province");
            default:
                return null;
        }
    };

    //storing the suggestions in a state variable when they are received from usePlacesAutocomplete
    useEffect(() => {
        if (status === "OK") {
            setAutocompleteSuggestions(data);
        } else {
            setAutocompleteSuggestions([]);
        }
    }, [status, data]);

    // Function to handle address update when user clicks use this address
    const handleAddressUpdate = async (locationData) => {
        setEditedLocation(locationData);
        setIncorrectAddress(false);
        clearSuggestions();
    };

    //to check if the location has changed and whether save button should be disabled
    const isLocationChanged = () => {
        return (
            editedLocation.address1 !== listing.location.address1 ||
            editedLocation.unitnumber !== listing.location.unitnumber ||
            editedLocation.city !== listing.location.city ||
            editedLocation.stateprovince !== listing.location.stateprovince ||
            editedLocation.postalcode !== listing.location.postalcode ||
            editedLocation.countryregion !== listing.location.countryregion
        );
    };

    //HANDLERS

    //to open the edit location form
    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    // handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedLocation({ ...editedLocation, [name]: value });
        setValue(formattedAddress);
    };

    // to check if there is a partial match
    const handleGeoCheck = async () => {
        try {
            // checks if there are any results given the form data address after its formatted
            const results = await getGeocode({ address: formattedAddress });

            //if there are any objects in the array with partial_match = true that means it is an incorrect address
            if ("partial_match" in results[0]) {
                setIncorrectAddress(true);

                //if the autocomplete suggestions array set from autocomplete is more than 0
                if (autocompleteSuggestions.length > 0) {
                    // take the top autocomplete address
                    const finalResults = await getGeocode({
                        address: autocompleteSuggestions[0].description,
                    });

                    //update its lat and lng
                    const { lat, lng } = getLatLng(finalResults[0]);
                    // use function to format address into components
                    const addressComponents = formatLocationData(
                        finalResults[0]
                    );
                    //set the address components to return and show user
                    const firstSuggestion = { ...addressComponents, lat, lng };
                    setPartialAddress(autocompleteSuggestions[0].description);
                    setPartialAddressComponents(firstSuggestion);

                    return false;
                } else {
                    //set the address components to update the form
                    setPartialAddressComponents(results[0].formatted_address);

                    return true;
                }
            } else {
                //it is the correct address, do the above calculations and move on
                const addressComponents = formatLocationData(results[0]);
                const { lat, lng } = getLatLng(results[0]);
                const updateData = { ...addressComponents, lat, lng };
                setEditedLocation(updateData);
                setIncorrectAddress(false);

                return true;
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    //handle saves
    const handleSave = async () => {
        //get if it is an incorrect address or not using our handleGeoCheck function
        const advanceToNextFormStep = await handleGeoCheck();

        //do the following if we get true
        if (advanceToNextFormStep) {
            setTouched({
                address1: true,
                city: true,
                countryregion: true,
                postalcode: true,
                stateprovince: true,
                // unitnumber remains untouched
            });

            //check if there are any errors, if not, update database
            if (Object.values(errors).every((error) => error === null)) {
                //format data for update
                const updateData = { location: editedLocation };

                //update state
                dispatch({
                    type: "UPDATE_LOCATION",
                    payload: editedLocation,
                });

                //call the function to push to database from context
                await pushToDatabase(listing._id, updateData);
                setIsEditing(false);
            }
        }
    };

    //function to force save and update database if user doesnt want to use suggested address
    const handleForceSave = async () => {
        setTouched({
            address1: true,
            city: true,
            countryregion: true,
            postalcode: true,
            stateprovince: true,
            // unitnumber remains untouched
        });

        //check if there are any errors, if not, update database
        if (Object.values(errors).every((error) => error === null)) {
            //format data for update
            const updateData = { location: editedLocation };

            //update state
            dispatch({
                type: "UPDATE_LOCATION",
                payload: editedLocation,
            });

            //call the function to push to database from context
            await pushToDatabase(listing._id, updateData);
            clearSuggestions();
            setIncorrectAddress(false);
            setPartialAddress("");
            setAutocompleteSuggestions([]);
            setIsEditing(false);
        }
    };

    //handle cancel
    const handleCancel = () => {
        setEditedLocation(listing.location);
        // Reset validation state for title
        setErrors({});
        setTouched((prevTouched) => ({
            ...prevTouched,
            title: false,
            address1: false,
            unitnumber: false,
            city: false,
            stateprovince: false,
            postalcode: false,
            countryregion: false,
        }));
        clearSuggestions();
        setIncorrectAddress(false);
        setPartialAddress("");
        setAutocompleteSuggestions([]);
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center">
                <div className="text-lg font-bold">Location</div>
                {isEditing ? (
                    <div className="flex gap-4 items-center">
                        <Button
                            size="sm"
                            variant="link"
                            className="underline h-6 p-0"
                            onClick={handleSave}
                            disabled={
                                hasErrors(errors) ||
                                !isLocationChanged() ||
                                pushing
                            }
                        >
                            {pushing ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Save"
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="link"
                            className="h-6 p-0"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <div onClick={handleEditClick}>Edit</div>
                )}
            </div>
            {incorrectAddress && partialAddress && (
                <div
                    className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
                    role="alert"
                >
                    <p className="font-bold">Did you mean:</p>
                    <p>{partialAddress}</p>
                    <div className="flex w-full justify-between">
                        <button
                            className="mt-2 text-blue-800 hover:text-blue-600"
                            onClick={() =>
                                handleAddressUpdate(partialAddressComponents)
                            }
                        >
                            Use this address
                        </button>
                        <button
                            className="mt-2 text-blue-800 hover:text-blue-600"
                            onClick={handleForceSave}
                        >
                            No, Save
                        </button>
                    </div>
                </div>
            )}
            {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                    <AuthInput
                        title="Street Address"
                        type="text"
                        name="address1"
                        value={editedLocation.address1}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.address1}
                        touched={touched.address1}
                    />
                    <AuthInput
                        title="Unit Number"
                        type="text"
                        name="unitnumber"
                        value={editedLocation.unitnumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    <AuthInput
                        title="City"
                        type="text"
                        name="city"
                        value={editedLocation.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.city}
                        touched={touched.city}
                    />
                    <AuthInput
                        title="State / Province"
                        type="text"
                        name="stateprovince"
                        value={editedLocation.stateprovince}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.stateprovince}
                        touched={touched.stateprovince}
                    />
                    <AuthInput
                        title="Postal / ZIP Code"
                        type="text"
                        name="postalcode"
                        value={editedLocation.postalcode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.postalcode}
                        touched={touched.postalcode}
                    />
                    <AuthInput
                        title="Country / Region"
                        type="text"
                        name="countryregion"
                        value={editedLocation.countryregion}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.countryregion}
                        touched={touched.countryregion}
                    />
                </div>
            ) : (
                <div className="font-light">{formattedAddressForDisplay}</div>
            )}
        </div>
    );
};

export default EditLocation;
