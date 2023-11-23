import React from "react";

export default function PrivacyTypeOption({
    data,
    type,
    title,
    description,
    onChange,
}) {
    const checkedPrivacyType = data.privacyType;

    return (
        <label className="cursor-pointer">
            <input
                id={type}
                name="privacyType"
                type="radio"
                value={type}
                checked={checkedPrivacyType === type}
                onChange={onChange}
                className="peer sr-only"
            />
            <div
                htmlFor="entire"
                className="flex justify-between items-center w-full h-full border border-gray-300 rounded p-2 hover:shadow ring-2 ring-transparent peer-checked:text-white peer-checked:bg-color-primary peer-checked:border-color-primary"
            >
                <div className="flex flex-col items-start text-sm">
                    <div>{title}</div>
                    <div>{description}</div>
                </div>
                <div>Img</div>
            </div>
        </label>
    );
}
