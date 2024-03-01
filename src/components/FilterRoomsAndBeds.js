import React from "react";
import RoundedToggleGroup from "./RoundedToggleGroup";

const FilterRoomsAndBeds = ({
    selectedBedrooms,
    onBedroomsChange,
    selectedBathrooms,
    onBathroomsChange,
}) => {
    // Example items for each category
    const bedroomItems = [
        { value: "any", label: "Any Bedroom", text: "any" },
        { value: "1", label: "One Bedroom", text: "1" },
        { value: "2", label: "Two Bedrooms", text: "2" },
        { value: "3", label: "Three Bedrooms", text: "3" },
        { value: "4", label: "Four Bedrooms", text: "4" },
        { value: "5", label: "Five Bedrooms", text: "5" },
        { value: "6+", label: "Six Plus Bedrooms", text: "6+" },
    ];

    /*
    const bedItems = [
        { value: "any", label: "Any Bed", text: "any" },
        { value: "1", label: "One Bed", text: "1" },
        { value: "2", label: "Two Beds", text: "2" },
        { value: "3", label: "Three Beds", text: "3" },
        { value: "4", label: "Four Beds", text: "4" },
        { value: "5", label: "Five Beds", text: "5" },
        { value: "6+", label: "Six Plus Beds", text: "6+" },
    ];
    */

    const bathroomItems = [
        { value: "any", label: "Any Bathroom", text: "any" },
        { value: "1", label: "One Bathroom", text: "1" },
        { value: "2", label: "Two Bathrooms", text: "2" },
        { value: "3", label: "Three Bathrooms", text: "3" },
        { value: "4", label: "Four Bathrooms", text: "4" },
        { value: "5", label: "Five Bathrooms", text: "5" },
        { value: "6+", label: "Six Plus Bathrooms", text: "6+" },
    ];

    return (
        <div className="flex flex-col gap-4 pb-4 border-b-2">
            <div className="font-bold">Rooms and beds</div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    <div className="font-medium">Bedrooms</div>
                    <RoundedToggleGroup
                        items={bedroomItems}
                        type="single"
                        selectedValues={selectedBedrooms}
                        onSelectedValuesChange={onBedroomsChange}
                        required={true}
                    />
                </div>
                {/* <div className="flex flex-col gap-4">
                    <div className="font-medium">Beds</div>
                    <RoundedToggleGroup
                        items={bedItems}
                        type="single"
                        selectedValues={selectedBeds}
                        onSelectedValuesChange={onBedsChange}
                        required={true}
                    />
                </div> */}
                <div className="flex flex-col gap-4">
                    <div className="font-medium">Bathrooms</div>
                    <RoundedToggleGroup
                        items={bathroomItems}
                        type="single"
                        selectedValues={selectedBathrooms}
                        onSelectedValuesChange={onBathroomsChange}
                        required={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterRoomsAndBeds;
