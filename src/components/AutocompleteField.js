import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Input from "./Input";
import { useState } from "react";

const AutocompleteField = ({ onAddressSelect, formatLocationData }) => {
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
        const locationData = { ...addressComponents, lat, lng };

        onAddressSelect(locationData); // Callback to parent component
    };

    return (
        <div className="flex flex-col w-full text-sm h-6">
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
                        className="flex flex-col items-center text-sm"
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
