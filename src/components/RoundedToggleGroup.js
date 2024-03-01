import React from "react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

const RoundedToggleGroup = ({
    items,
    type = "single",
    selectedValues,
    variant = "outline",
    required = false,
    onSelectedValuesChange,
    size = "default",
}) => {
    const handleValueChange = (value) => {
        if (required && !value) {
            return;
        }
        onSelectedValuesChange(value);
    };

    return (
        <ToggleGroup
            className={"overflow-x-scroll justify-start no-scrollbar"}
            type={type}
            value={selectedValues}
            onValueChange={handleValueChange}
        >
            {items.map((item) => (
                <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    aria-label={item.label}
                    variant={variant}
                    size={size}
                    className="rounded-2xl px-8"
                >
                    {item.text}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
};

export default RoundedToggleGroup;
