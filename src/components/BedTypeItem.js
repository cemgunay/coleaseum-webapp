const BedTypeItem = ({bedTypeName, bedTypeIncluded, handleChange}) => {

    return (
        <label className="cursor-pointer">
            <input
                id={bedTypeName}
                name={bedTypeName}
                type="checkbox"
                checked={bedTypeIncluded}
                onChange={handleChange}
                className="peer sr-only"
            />
            <span className="peer-checked:text-white peer-checked:bg-color-primary peer-checked:border-color-primary flex justify-center items-center p-4 border border-gray-300 rounded-lg text-xs hover:shadow ring-2 ring-transparent">
                {bedTypeName}
            </span>
        </label>
    );
}

export default BedTypeItem;