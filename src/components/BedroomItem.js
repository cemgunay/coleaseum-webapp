import BedTypeItem from "./BedTypeItem";
import Input from "./Input";

//all the bed types available (can more if needed)
const bedTypes = ["Single", "Double", "Queen", "King", "Sofa Bed", "Other"];

//Each bedroom item for creating a listing that updates "basics"
const BedroomItem = ({ index, bedrooms, bedroom, dispatch, setBedrooms }) => {
    //to toggle the bed types in the bedroom
    const handleBedType = (e) => {
        const { name, checked } = e.target;

        // Construct the updated bedTypes array for this bedroom
        const updatedBedTypes = checked
            ? [...bedroom.bedType, name]
            : bedroom.bedType.filter((bt) => bt !== name);

        // Create a new bedrooms array with the updated bedTypes for the specified bedroom
        const updatedBedrooms = bedrooms.map((bed, idx) => {
            if (idx === index) {
                return { ...bed, bedType: updatedBedTypes };
            }
            return bed;
        });

        // Dispatch the update using the existing UPDATE_BASICS action type
        if (dispatch) {
            dispatch({
                type: "UPDATE_BASICS",
                payload: { bedrooms: updatedBedrooms },
            });
        } else {
            setBedrooms((prevState) => ({
                ...prevState,
                bedrooms: updatedBedrooms,
            }));
        }
    };

    //to toggle if bedroom item has an ensuite
    const handleEnsuite = (e) => {
        // Create a new bedrooms array with the updated ensuite for the specified bedroom
        const updatedBedrooms = bedrooms.map((bed, idx) => {
            if (idx === index) {
                return { ...bed, ensuite: e.target.checked };
            }
            return bed;
        });

        // Dispatch the update using the existing UPDATE_BASICS action type
        if (dispatch) {
            dispatch({
                type: "UPDATE_BASICS",
                payload: { bedrooms: updatedBedrooms },
            });
        } else {
            setBedrooms((prevState) => ({
                ...prevState,
                bedrooms: updatedBedrooms,
            }));
        }
    };

    return (
        <div className="w-full flex flex-col gap-2 border-2 rounded p-4">
            <div>Bedroom {index + 1}</div>
            <div className="grid grid-cols-3 gap-2">
                {bedTypes.map((bedType, index) => (
                    <BedTypeItem
                        key={index}
                        bedTypeName={bedType}
                        bedTypeIncluded={bedroom.bedType.includes(bedType)}
                        handleChange={handleBedType}
                    />
                ))}
            </div>
            <div className="flex items-center gap-4">
                <label className="text-sm" htmlFor={`ensuite-${index}`}>
                    Ensuite
                </label>{" "}
                {/* Match the htmlFor with the input's id */}
                <Input
                    id={`ensuite-${index}`} // Ensures the ID is unique for each bedroom
                    type="checkbox"
                    checked={bedroom.ensuite}
                    onChange={handleEnsuite}
                    className="accent-color-primary w-3 h-3 rounded-sm cursor-pointer mr-2 checked:bg-white"
                />
            </div>
        </div>
    );
};

export default BedroomItem;
