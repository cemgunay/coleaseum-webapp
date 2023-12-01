import { FaWifi, FaParking, FaSwimmingPool } from "react-icons/fa";

const getAmenityIcon = (amenityName) => {
    const iconMap = {
        wifi: <FaWifi />,
        parking: <FaParking />,
        pool: <FaSwimmingPool />,
        // ... more mappings
    };
    return iconMap[amenityName] || null; // Default case if no icon is found
};

const AmenityItem = ({ amenityName, amenityValue, handleChange }) => {

    return (
        <label className="cursor-pointer">
            <input
                id={amenityName}
                name={amenityName}
                type="checkbox"
                checked={amenityValue}
                onChange={handleChange}
                className="peer sr-only"
            />
            <span className="peer-checked:text-white peer-checked:bg-color-primary peer-checked:border-color-primary flex justify-center items-center p-4 border border-gray-300 rounded-lg text-sm hover:shadow ring-2 ring-transparent">
                {getAmenityIcon(amenityName)}
                {amenityName}
            </span>
        </label>
    );
};

export default AmenityItem;
