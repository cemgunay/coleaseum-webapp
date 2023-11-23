import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Input from "./Input";
import { useState } from "react";

//helper function to format the address receieved from usePlacesAutocomplete
const formatLocationData = (address) => {
    const addressComponents = address.address_components;

    let address1 = "";
    let city = "";
    let countryregion = "";
    let postalcode = "";
    let stateprovince = "";
    let lat = "";
    let lng = "";

    // Extracting components from address_components
    addressComponents.forEach((component) => {
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

    return { address1, city, countryregion, postalcode, stateprovince };
};

const AutocompleteField = ({dispatch}) => {
    //state to control Popover visibility
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    //google use places autocomplete hook
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete();

    // handle what happens when user is typing
    const handleChange = (event) => {
        setValue(event.target.value);
        setIsPopoverOpen(true);
    };

    // handle what happens when user selects a suggestion
    const handleSelect = async (address) => {
        console.log(address);
        setValue(address, false);
        clearSuggestions();
        // Delay closing the popover to allow the input field to lose focus
        setTimeout(() => {
            setIsPopoverOpen(false);
        }, 100); // Adjust the delay as needed

        //get results with geoCode and the lat lng from that
        const results = await getGeocode({ address });
        const { lat, lng } = getLatLng(results[0]);

        // use function to format address into components
        const addressComponents = formatLocationData(results[0]);

        // Combine lat, lng with addressComponents
        const locationData = {
            ...addressComponents,
            lat,
            lng,
        };

        // Dispatch an action to update the location in your state
        dispatch({
            type: "UPDATE_LOCATION",
            payload: locationData,
        });
    };

    return (
        <div className="flex flex-col">
            <Popover
                open={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                side="bottom"
            >
                <PopoverTrigger asChild>
                    <Input
                        placeholder="Enter location"
                        type="text"
                        name="address"
                        value={value}
                        onChange={handleChange}
                        disabled={!ready}
                    />
                </PopoverTrigger>
                {status === "OK" && (
                    <PopoverContent
                        className="flex flex-col items-center"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        {data.map((suggestion) => (
                            <div
                                key={suggestion.place_id}
                                className="flex gap-2 p-2 cursor-pointer"
                                onClick={() =>
                                    handleSelect(suggestion.description)
                                }
                            >
                                {suggestion.description}
                            </div>
                        ))}
                    </PopoverContent>
                )}
            </Popover>
        </div>
    );
};

export default AutocompleteField;
