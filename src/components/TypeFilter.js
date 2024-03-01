import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

const TypeFilter = ({ onTypeChange, initialType }) => {
    const [type, setType] = useState(initialType);

    const typeDescriptions = {
        any: "Search rooms, entire places, or any type of place.",
        entire: "A place all to yourself",
        room: "A room in a shared space",
    };

    const [description, setDescription] = useState(typeDescriptions.any);

    const handleSetType = (value) => {
        setType(value);
        setDescription(typeDescriptions[value]);
        onTypeChange(value); // Call the callback with the new type
    };

    return (
        <div className="flex flex-col gap-4 border-b-2 pb-4">
            <div className="font-bold">Type of place</div>
            <div className="h-6 text-sm">{description}</div>
            <ToggleGroup
                className={"gap-0"}
                type="single"
                value={type}
                variant={"outline"}
                onValueChange={(value) => {
                    if (value) handleSetType(value);
                }}
            >
                <ToggleGroupItem
                    className={"rounded-none rounded-l-md w-full h-14"}
                    value="any"
                    aria-label="Any type"
                >
                    Any Type
                </ToggleGroupItem>
                <ToggleGroupItem
                    className={"rounded-none w-full h-14"}
                    value="entire"
                    aria-label="Entire place"
                >
                    Entire
                </ToggleGroupItem>
                <ToggleGroupItem
                    className={"rounded-none rounded-r-md w-full h-14"}
                    value="room"
                    aria-label="A shared room"
                >
                    Room
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
};

export default TypeFilter;
