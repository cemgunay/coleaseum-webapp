import { FaWifi, FaParking, FaSwimmingPool } from "react-icons/fa";

//to get coresponding icon based on utilityname provided
const getUtilityIcon = (utilityName) => {
    const iconMap = {
        wifi: <FaWifi />,
        parking: <FaParking />,
        pool: <FaSwimmingPool />,
        // ... more mappings
    };
    return iconMap[utilityName] || null; // Default case if no icon is found
};

const UtilityItem = ({ utilityName, utilityValue, handleChange }) => {
    return (
        <label className="cursor-pointer">
            <input
                id={utilityName}
                name={utilityName}
                type="checkbox"
                checked={utilityValue}
                onChange={handleChange}
                className="peer sr-only"
            />
            <span className="peer-checked:text-white peer-checked:bg-color-primary peer-checked:border-color-primary flex justify-center items-center p-4 border border-gray-300 rounded-lg text-sm hover:shadow ring-2 ring-transparent">
                {getUtilityIcon(utilityName)}
                {utilityName}
            </span>
        </label>
    );
};

export default UtilityItem;
