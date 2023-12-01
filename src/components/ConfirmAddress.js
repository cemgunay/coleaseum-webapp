import React, { useEffect } from "react";
import AuthInput from "@/components/AuthInput";
import usePlacesAutocomplete from "use-places-autocomplete";

const ConfirmAddress = ({
    combinedListingFormDispatch,
    locationData,
    formattedAddress,
    handleBlur,
    errors,
    touched,
    onNext,
    incorrectAddress,
    setIncorrectAddress,
    partialAddress,
    partialAddressComponents,
    setAutocompleteSuggestions,
}) => {
    // initialize usePlacesAutocomplete
    const {
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete();

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
        // Dispatch an action to update the location in your state
        combinedListingFormDispatch({
            type: "UPDATE_LOCATION",
            payload: locationData,
        });

        setIncorrectAddress(false);
        clearSuggestions();
    };

    // handle ConfirmAddress form input changes
    const handleChange = (e) => {
        combinedListingFormDispatch({
            type: "UPDATE_LOCATION",
            payload: { [e.target.name]: e.target.value },
        });
        setValue(formattedAddress);
    };

    return (
        <div className="mx-8 flex flex-col gap-4">
            <div className="text-lg">Confirm your address</div>
            {incorrectAddress && partialAddress && (
                <div
                    className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
                    role="alert"
                >
                    <p className="font-bold">Did you mean:</p>
                    <p>{partialAddress}</p>
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
                        onClick={(e) => onNext(e)}
                    >
                        No, Continue
                    </button>
                </div>
            )}
            <AuthInput
                title="Street Address"
                type="text"
                name="address1"
                value={locationData.address1}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.address1}
                touched={touched.address1}
            />
            <AuthInput
                title="Unit Number"
                type="text"
                name="unitnumber"
                value={locationData.unitnumber}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <AuthInput
                title="City"
                type="text"
                name="city"
                value={locationData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.city}
                touched={touched.city}
            />
            <AuthInput
                title="State / Province"
                type="text"
                name="stateprovince"
                value={locationData.stateprovince}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.stateprovince}
                touched={touched.stateprovince}
            />
            <AuthInput
                title="Postal / ZIP Code"
                type="text"
                name="postalcode"
                value={locationData.postalcode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.postalcode}
                touched={touched.postalcode}
            />
            <AuthInput
                title="Country / Region"
                type="text"
                name="countryregion"
                value={locationData.countryregion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.countryregion}
                touched={touched.countryregion}
            />
        </div>
    );
};

export default ConfirmAddress;
