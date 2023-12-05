import React from "react";
import { FaLock, FaUsers, FaHouse } from "react-icons/fa6";

// Adjust the size and margin as needed
const iconStyle = "text-2xl";

// set the privacy icons
const PrivacyIcon = ({ type }) => {
    switch (type) {
        case "Entire":
            return <FaHouse className={iconStyle} />;
        case "Private":
            return <FaLock className={iconStyle} />;
        case "Shared":
            return <FaUsers className={iconStyle} />;
        default:
            return null;
    }
};

const PrivacyTypeOption = ({ data, type, title, description, onChange }) => {

    //check if privacy type exists in data
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
            <div className="flex justify-between gap-4 items-center border border-gray-300 rounded py-2 px-3 hover:shadow ring-2 ring-transparent peer-checked:text-white peer-checked:bg-color-primary peer-checked:border-color-primary h-20">
                <div className="flex flex-col gap-1 text-sm h-full">
                    <div className="font-bold">{title}</div>
                    <div>{description}</div>
                </div>
                <div className="flex items-center justify-center">
                    <PrivacyIcon type={type} />
                </div>
            </div>
        </label>
    );
};

export default PrivacyTypeOption;
