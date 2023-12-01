import ConfirmAddress from "@/components/ConfirmAddress";
import ConfirmMarker from "@/components/ConfirmMarker";
import CreateListingLayout from "@/components/CreateListingLayout";
import EnterAddress from "@/components/EnterAddress";
import { useListingForm } from "@/hooks/useListingForm";
import { useLoadScript } from "@react-google-maps/api";
import { useMemo, useState, useEffect } from "react";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { useRouter } from "next/router";
import Skeleton from "@/components/Skeleton";

const libraries = ["places"];

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

const Location = () => {
    //initialize router
    const router = useRouter();

    //to conditionally render the location form components 1-3
    const [currentLocationFormStep, setCurrentLocationFormStep] = useState(1);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [isLoadingCorrectStep, setIsLoadingCorrectStep] = useState(true);

    //to check if we can proceed to next page
    const [canGoNext, setCanGoNext] = useState(true);

    //get context
    const {
        setPushing,
        listingId,
        combinedListingFormState,
        combinedListingFormDispatch,
        pushToDatabase,
    } = useListingForm();

    //name our data and formattedAddress variable that we will use
    const locationData = combinedListingFormState?.location;
    const formattedAddress = useMemo(() => {
        // Handle optional unitnumber
        const unit = locationData.unitnumber
            ? `${locationData.unitnumber}, `
            : "";
        return `${unit}${locationData.address1}, ${locationData.city}, ${locationData.stateprovince} ${locationData.postalcode}, ${locationData.countryregion}`;
    }, [locationData]);

    // Check if locationData is not null (or has the required properties) to render the correct step within the location form
    useEffect(() => {
        if (
            !initialLoadComplete &&
            currentLocationFormStep !== 2 &&
            locationData &&
            locationData.address1 &&
            locationData.city &&
            locationData.stateprovince &&
            locationData.postalcode &&
            locationData.countryregion
        ) {
            setCurrentLocationFormStep(3);
            setInitialLoadComplete(true);
        }
    }, [locationData]);

    // for help with checking users address and returning suggested address
    const [incorrectAddress, setIncorrectAddress] = useState(false);
    const [partialAddress, setPartialAddress] = useState("");
    const [partialAddressComponents, setPartialAddressComponents] =
        useState("");
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);

    //for ConfirmAddress form errors and if they have been touched
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        address1: false,
        unitnumber: false,
        city: false,
        stateprovince: false,
        postalcode: false,
        countryregion: false,
    });

    // set position of map with values from our data
    // if no values then use default (shows waterloo)
    const position = {
        lat: locationData.lat || 43.4643,
        lng: locationData.lng || -80.5204,
    };

    //google maps api load script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    // Function to handle address selection from Autocomplete component
    const handleAddressSelect = async (locationData) => {
        // Ensure unitNumber is included in locationData with a default value if not present
        const updatedLocationData = {
            ...locationData,
            unitnumber: locationData.unitnumber ?? "", // Use an empty string if unitnumber is not present
        };

        // Dispatch an action to update the location in your state
        combinedListingFormDispatch({
            type: "UPDATE_LOCATION",
            payload: updatedLocationData,
        });

        setCurrentLocationFormStep(2);
    };

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

    // to check if there is a partial match (ill comment this more in detail later)
    const handleGeoCheck = async () => {
        console.log(formattedAddress);
        try {
            const results = await getGeocode({ address: formattedAddress });

            console.log(results);

            if ("partial_match" in results[0]) {
                setIncorrectAddress(true);

                if (autocompleteSuggestions.length > 0) {
                    const finalResults = await getGeocode({
                        address: autocompleteSuggestions[0].description,
                    });
                    const { lat, lng } = getLatLng(finalResults[0]);
                    // use function to format address into components
                    const addressComponents = formatLocationData(
                        finalResults[0]
                    );
                    const firstSuggestion = { ...addressComponents, lat, lng };
                    setPartialAddress(autocompleteSuggestions[0].description);
                    setPartialAddressComponents(firstSuggestion);

                    return false;
                } else {
                    setPartialAddressComponents(results[0].formatted_address);

                    return true;
                }
            } else {
                const addressComponents = formatLocationData(results[0]);
                const { lat, lng } = getLatLng(results[0]);
                const updateData = { ...addressComponents, lat, lng };
                console.log(updateData);
                combinedListingFormDispatch({
                    type: "UPDATE_LOCATION",
                    payload: updateData,
                });
                setIncorrectAddress(false);

                return true;
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    //update canGoNext to see if we can move through the location form or submit
    useEffect(() => {
        //if on EnterAddress dont allow clicking next (they must select an autocomplete or enter manually)
        if (currentLocationFormStep === 1) {
            setCanGoNext(false);
        } else {
            setCanGoNext(true);
        }
    }, [currentLocationFormStep]);

    //set errors on the field forms
    useEffect(() => {
        const newErrors = {
            address1: validateRequired(locationData.address1, "Address"),
            city: validateRequired(locationData.city, "City"),
            countryregion: validateRequired(
                locationData.countryregion,
                "Country"
            ),
            postalcode: validatePostalCode(locationData.postalcode),
            stateprovince: validateRequired(
                locationData.stateprovince,
                "State/Province"
            ),
        };
        setErrors(newErrors);
    }, [locationData]);

    //Conditionally render the correct components when clicking next (ConfirmAddress, ConfirmMarker) and then submit at the end
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (currentLocationFormStep === 1) {
            setCurrentLocationFormStep(2);
        } else if (currentLocationFormStep === 2) {
            //check if we can advance to next step from our handleGeoCheck return
            setPushing(true);
            const advanceToNextFormStep = await handleGeoCheck();
            setPushing(false);

            if (advanceToNextFormStep) {
                setTouched({
                    address1: true,
                    city: true,
                    countryregion: true,
                    postalcode: true,
                    stateprovince: true,
                    // unitnumber remains untouched
                });

                //check if there are any errors, if not go to next page
                if (Object.values(errors).every((error) => error === null)) {
                    setCurrentLocationFormStep(3);
                }
            }
        } else {
            //if on last step we push to database
            const updateData = { location: locationData };
            await pushToDatabase(listingId, updateData, "basics");
        }
    };

    //Conditionally render the correct components when clicking back (ConfirmAddress, ConfirmMarker) and then go back to about-your-place
    const handleBack = () => {
        if (currentLocationFormStep === 1) {
            router.push(`/host/create-listing/${listingId}/about-your-place`);
        } else if (currentLocationFormStep === 2) {
            setCurrentLocationFormStep(1);
        } else {
            setCurrentLocationFormStep(2);
        }
    };

    const Loading = () => {
        if (loadError) {
            return <div>Error Loading Maps</div>;
        }
        return (
            <div className="mx-8 my-4 h-full flex flex-col gap-4">
                <Skeleton className="h-14 w-3/4 mb-2" />
                <Skeleton className="h-full w-full mb-2" />
            </div>
        );
    };

    //to render the correct components based on what step of the location form we are at
    const renderStepContent = () => {
        switch (currentLocationFormStep) {
            case 1:
                return (
                    <EnterAddress
                        handleSubmit={handleSubmit}
                        onAddressSelect={handleAddressSelect}
                        isLoaded={isLoaded}
                        loadError={loadError}
                        position={position}
                        formatLocationData={formatLocationData}
                    />
                );
            case 2:
                return (
                    <ConfirmAddress
                        combinedListingFormDispatch={
                            combinedListingFormDispatch
                        }
                        locationData={locationData}
                        formattedAddress={formattedAddress}
                        handleBlur={handleBlur}
                        errors={errors}
                        touched={touched}
                        onNext={handleSubmit}
                        incorrectAddress={incorrectAddress}
                        setIncorrectAddress={setIncorrectAddress}
                        partialAddress={partialAddress}
                        partialAddressComponents={partialAddressComponents}
                        setAutocompleteSuggestions={setAutocompleteSuggestions}
                    />
                );
            case 3:
                return (
                    <ConfirmMarker
                        position={position}
                        isLoaded={isLoaded}
                        loadError={loadError}
                        combinedListingFormDispatch={
                            combinedListingFormDispatch
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <CreateListingLayout
            Loading={Loading}
            componentSpecificIsLoading={
                !isLoaded ||
                (!initialLoadComplete && currentLocationFormStep === 3)
            }
            currentStep={2}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            {renderStepContent()}
        </CreateListingLayout>
    );
};

export default Location;
