import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
    getDetails,
} from "use-places-autocomplete";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Input from "./Input";
import { useState } from "react";
import inferZoomLevel from "@/utils/inferZoomLevel";

const AutocompleteField = ({ onAddressSelect, formatLocationData }) => {
    //state to control Popover visibility
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Central location in Canada: near Saskatoon, Saskatchewan
    const centralCanada = {
        lat: 52.1332,
        lng: -106.67,
    };

    //google use places autocomplete hook
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            // Apply location bias towards central Canada
            location: new google.maps.LatLng(
                centralCanada.lat,
                centralCanada.lng
            ),
            radius: 2000 * 1000, // 2000 km radius to cover a broad area of Canada
        },
    });

    // handle what happens when user is typing
    const handleChange = (event) => {
        setValue(event.target.value);
        setIsPopoverOpen(true);
    };

    // handle what happens when user selects a suggestion
    const handleSelect = async (address, placeId) => {
        setValue(address, false);
        clearSuggestions();
        // Delay closing the popover to allow the input field to lose focus
        setTimeout(() => {
            setIsPopoverOpen(false);
        }, 100); // Adjust the delay as needed

        //get results with geoCode and the lat lng from that
        const results = await getGeocode({ address });
        const { lat, lng } = getLatLng(results[0]);

        // Fetch additional place details to get types
        const details = await getDetails({ placeId });
        const zoomLevel = inferZoomLevel(details.types);

        // use function to format address into components
        const locationData = formatLocationData
            ? { ...formatLocationData(geocodeResults[0]), lat, lng, zoomLevel }
            : { lat, lng, name: address, zoomLevel };

        onAddressSelect(locationData);
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
                                    handleSelect(
                                        suggestion.description,
                                        suggestion.place_id
                                    )
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
