import React from "react";

export default function PropertyTypeOption({ data, type, onChange }) {

    //check if property type exists in data
    const checkedPropertyType = data.propertyType;

    return (
        <label className="cursor-pointer">
            <input
                id={type}
                name="propertyType"
                type="radio"
                value={type}
                checked={checkedPropertyType === type}
                onChange={onChange}
                className="peer sr-only"
            />
            <div className="flex justify-center items-center p-4 border border-gray-300 rounded-lg text-sm hover:shadow ring-2 ring-transparent peer-checked:text-white peer-checked:bg-color-primary peer-checked:border-color-primary">
                {type}
            </div>
        </label>
    );
}
